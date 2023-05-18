import { revalidatePath } from "next/cache"
import { Inngest } from "inngest"

import { IdeaWithCategory } from "@/types/collections"
import { supabase } from "@/lib/utils"
import IdeasPopup from "@/components/ui/ideas-popup"
import IdeasTable from "@/components/ideas-table"

export default async function IndexPage() {
  const { data: ideas } = await supabase
    .from("ideas")
    .select("*, category:categories(*)")
    .returns<IdeaWithCategory[]>()

  const addNewIdea = async (data: FormData) => {
    "use server"
    // Generate the idea
    const { data: generatedIdea } = await supabase
      .from("ideas")
      .insert({
        category: data.get("category") as unknown as number,
        idea: data.get("idea") as string,
      })
      .select("*")
      .single()

    if (!generatedIdea) throw new Error("Failed to generate idea")

    const inngest = new Inngest({
      name: "Blog Post Generator",
      eventKey: process.env.INNGEST_EVENT_KEY!,
    })

    // Send an event to Inngest
    await inngest.send({
      name: "app/generate.blog.post",
      data: {
        idea: generatedIdea.idea,
        category: generatedIdea.category,
        id: generatedIdea.id,
      },
    })
    // Revalidate the page
    revalidatePath("/")
  }

  return (
    <section className="container grid items-center gap-6 pt-6 pb-8 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          Create blog posts with AI automatically.
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground sm:text-xl mb-5">
          Put your ideas in the table and AI will write a blog post for you.
        </p>
        <IdeasPopup addNewHandler={addNewIdea} />
        <IdeasTable ideas={ideas} />
      </div>
    </section>
  )
}
