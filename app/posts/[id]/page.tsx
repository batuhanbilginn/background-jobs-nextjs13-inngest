import Image from "next/image"
import { notFound } from "next/navigation"

import { PostWithCategory } from "@/types/collections"
import { supabase } from "@/lib/utils"
import PostBody from "@/components/post/post-body"

export async function generateStaticParams() {
  const { data: posts } = await supabase.from("posts").select("id")
  if (!posts) return []

  return posts.map((post) => ({
    id: String(post.id),
  }))
}

const Page = async ({
  params: { id },
}: {
  params: {
    id: string
  }
}) => {
  const { data: post } = await supabase
    .from("posts")
    .select("*, category:categories(*)")
    .eq("id", id)
    .returns<PostWithCategory>()

  if (!post) notFound()

  return (
    <section className="container pt-6 pb-8 md:py-10">
      <div className="flex flex-col items-start gap-2">
        <div className="px-2 py-1 text-xs rounded-md bg-slate-200 dark:bg-slate-100 dark:text-slate-900">
          {post?.category?.title}
        </div>
        <h1 className="text-2xl font-extrabold leading-tight tracking-tighter sm:text-2xl md:text-4xl lg:text-5xl">
          {post.title}
        </h1>
        <Image
          src={post?.image ?? ""}
          alt={post?.title ?? ""}
          width={1920}
          height={1080}
          priority
          className="w-full h-[300px] mt-5 md:h-[500px] object-cover object-center rounded-lg"
        />
      </div>
      <article className="mt-8">
        <PostBody body={post.body!!} />
      </article>
    </section>
  )
}

export default Page
