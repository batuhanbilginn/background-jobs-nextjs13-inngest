import { PostWithCategory } from "@/types/collections"

import PostItem from "./post-item"

const PostList = ({ posts }: { posts: PostWithCategory[] }) => {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {posts?.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  )
}

export default PostList
