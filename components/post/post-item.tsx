import Link from "next/link"

import { PostWithCategory } from "@/types/collections"

const PostItem = ({ post }: { post: PostWithCategory }) => {
  return (
    <Link className="flex items-center gap-2" href={`/posts/${post.id}`}>
      <div className="px-2 py-1 text-xs rounded-md bg-slate-200 dark:bg-slate-100 dark:text-slate-900">
        {post.category.title}
      </div>
      <div className="underline transition-transform duration-75 ease-in-out underline-offset-4 hover:translate-x-2">
        {post.title}
      </div>
    </Link>
  )
}

export default PostItem
