import { Inngest } from "inngest"
import { serve } from "inngest/next"

import { Idea } from "@/types/collections"
import { OpenAIStream } from "@/lib/openai"
import { supabase } from "@/lib/utils"

// It needs to be like this: export const runtime="edge"
export const config = {
  runtime: "edge",
}

// Create a client to send and receive events
export const inngest = new Inngest({
  name: "Blog Post Generator",
  eventKey: process.env.INNGEST_EVENT_KEY!,
})

// Schedule a job to run on specific dates
export const sendIdeasToGenerator = inngest.createFunction(
  {
    name: "Send Ideas to Generator",
  },
  {
    // Run on schedule
    cron: "42 15 * * *",
  },
  async ({ step }) => {
    // Get Ideas From Database
    const events = await step.run("get ideas from database", async () => {
      const { data: ideas } = await supabase
        .from("ideas")
        .select("*")
        .eq("status", "waiting")
        .limit(3)
        .returns<Idea[]>()

      if (!ideas) {
        return []
      }

      const events = ideas.map((idea) => ({
        name: "app/generate.blog.post",
        data: {
          idea: idea.idea,
          category: idea.category,
          id: idea.id,
        },
      }))

      return events
    })

    await step.sendEvent(events)
  }
)

// Generate Blog Post
export const generateBlogPost = inngest.createFunction(
  { name: "Generate Blog Post" },
  { event: "app/generate.blog.post" },
  async ({ step, event }) => {
    const { idea, category, id } = event.data

    // STEP-1 Generate Outline for Blog Post
    const outline = await step.run("generate an outline", async () => {
      // Stream response from OpenAI
      const stream = await OpenAIStream({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a blog post outline generator. Base on the title user shared, generate an outline for a blog post. Only return the outline. Don't say anything beside the outline.",
          },
          {
            role: "user",
            content: `Generate an outline for this blog post idea: ${idea}`,
          },
        ],
        max_tokens: 1000,
        temperature: 0.55,
        stream: true,
      })
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let done = false
      let outline = ""

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        outline += chunkValue
      }

      return outline
    })

    // STEP-2A Create Keyword for Image Search
    const getKeyword = step.run("create keyword for Image", async () => {
      // Stream response from OpenAI
      const stream = await OpenAIStream({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a keyword generator. Base on the outline user shared, generate a keyword for hero image search of this blog post. Only return the keyword. Don't say anything beside the keyword.",
          },
          {
            role: "user",
            content:
              "Outline:I. Introduction\n- Brief history of Apple Inc.\n- Importance of knowing Apple's most selling product\n\nII. Apple's Product Line\n- Overview of Apple's product line\n- Explanation of each product\n\nIII. Factors Affecting Sales\n- Market demand\n- Competition\n- Product innovation\n- Marketing strategy\n\nIV. Apple's Most Selling Product\n- Analysis of sales figures\n- Comparison with other products\n- Factors contributing to its success\n\nV. Conclusion\n- Recap of Apple's product line\n- Importance of understanding the most selling product\n- Final thoughts and recommendations.",
          },
          { role: "assistant", content: "best-selling-apple-products" },
          {
            role: "user",
            content: `Outline: ${outline}`,
          },
        ],
        max_tokens: 500,
        temperature: 0.4,
        stream: true,
      })
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let done = false
      let keyword = ""

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        keyword += chunkValue
      }

      return keyword
    })

    // STEP-2B Generate Blog Post
    const generateBlogPost = step.run("generate a blog post", async () => {
      // Stream response from OpenAI
      const stream = await OpenAIStream({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a blog post generator. Base on the outline user shared, generate a blog post. Only return the blog post. Don't say anything beside the blog post. RETURN MARKDOWN! Use H tags for headings. Use tables for lists. Use links for links. Use images for images. Use bold for bold. Use italics for italics. Use blockquotes for blockquotes. Use code for code. Use code block for code block. Use horizontal rule for horizontal rule. Use line break for line break. Use strikethrough for strikethrough. Use superscript for superscript. Use subscript for subscript. Use math for math. Use latex for latex. Use latex block for latex block. Use latex inline for latex inline. Use latex display for latex display. Use latex environment for latex environment. Use latex command for latex command. Use latex argument for latex argument. Use latex argument",
          },
          {
            role: "user",
            content: `Generate a blog post for this outline: ${outline}`,
          },
        ],
        max_tokens: 3000,
        temperature: 0.75,
        stream: true,
      })
      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let done = false
      let blogPost = ""

      while (!done) {
        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        blogPost += chunkValue
      }

      return blogPost
    })

    //STEP 2 Results
    const [keyword, blogPost] = await Promise.all([
      getKeyword,
      generateBlogPost,
    ])

    // Step-3 Get Hero Image from Unsplash
    const heroImage = await step.run("get hero image", async () => {
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${keyword.toLocaleLowerCase()}&client_id=${
          process.env.UNSPLASH_ACCESS_KEY
        }`
      )
      const { results } = await response.json()
      return results?.[0]?.urls?.regular ?? ""
    })

    // Step-4A Save Post and Update Idea Status
    const savePost = step.run("save post", async () => {
      const { data: savedPost } = await supabase
        .from("posts")
        .insert({
          title: idea,
          body: blogPost,
          image: heroImage,
          category,
        })
        .select("id")
        .single()

      return savedPost
    })

    // Step-4B Update Idea Status
    const updateIdeaStatus = step.run("update idea status", async () => {
      await supabase.from("ideas").update({ status: "generated" }).match({ id })
    })

    // Step-4 Results
    const [savedPost] = await Promise.all([savePost, updateIdeaStatus])

    // Step-5 Revalidate Pages
    await Promise.all([
      step.run("revalidate posts", async () => {
        await fetch(`http://localhost:3000/api/revalidate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: "/posts" }),
        })
      }),
      step.run("revalidate post", async () => {
        await fetch(`http://localhost:3000/api/revalidate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: `/posts/${savedPost?.id}` }),
        })
      }),
      step.run("revalidate home", async () => {
        await fetch(`http://localhost:3000/api/revalidate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ path: "/" }),
        })
      }),
    ])
  }
)

// Create an API that hosts zero functions
export const { GET, POST, PUT } = serve(
  inngest,
  [sendIdeasToGenerator, generateBlogPost],
  {
    streaming: "allow",
    signingKey: process.env.INNGEST_SIGNING_KEY!,
  }
)
