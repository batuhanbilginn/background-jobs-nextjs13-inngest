import { revalidatePath } from "next/cache"

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
    await supabase
      .from("ideas")
      .insert({ category: data.get("category"), idea: data.get("idea") })
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
