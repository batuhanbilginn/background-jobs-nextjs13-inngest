import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const PostBody = ({ body }: { body: string }) => {
  return (
    <ReactMarkdown className="break-words markdown" remarkPlugins={[remarkGfm]}>
      {body ?? ""}
    </ReactMarkdown>
  )
}

export default PostBody
