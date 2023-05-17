import { IdeaWithCategory } from "@/types/collections"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const IdeasTable = ({ ideas }: { ideas: IdeaWithCategory[] | null }) => {
  return (
    <div className="w-full mt-10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px] whitespace-nowrap">
              Created At
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Idea</TableHead>
            <TableHead className="max-w-fit">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ideas?.map((idea) => (
            <TableRow key={idea.id}>
              <TableCell className="font-medium">
                {new Date(idea.created_at!).toLocaleTimeString("tr-TR")}
              </TableCell>
              <TableCell>
                <span className="px-2 py-1 text-xs rounded-md bg-slate-200 dark:bg-slate-100 dark:text-slate-900">
                  {idea.category?.title}
                </span>
              </TableCell>
              <TableCell className="w-full">{idea.idea}</TableCell>
              <TableCell className="max-w-fit">
                <span className="px-2 py-1 text-xs rounded-md bg-slate-200 dark:bg-slate-800">
                  {idea.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default IdeasTable
