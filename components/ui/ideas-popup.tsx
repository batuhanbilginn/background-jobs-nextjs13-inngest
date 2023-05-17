import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "./button"
import { Input } from "./input"

const IdeasPopup = ({
  addNewHandler,
}: {
  addNewHandler: (data: FormData) => Promise<void>
}) => {
  return (
    <Dialog>
      <DialogTrigger>+ Add New Idea</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Idea</DialogTitle>
          <DialogDescription>
            Fill the form to add new idea to the table.
          </DialogDescription>
          <form action={addNewHandler} className="pt-5 space-y-4">
            <Select name="category">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  <SelectItem value="1">Apple</SelectItem>
                  <SelectItem value="2">Samsung</SelectItem>
                  <SelectItem value="3">Huawei</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Input
              placeholder="Write the content idea."
              id="idea"
              name="idea"
            />
            <Button className="w-full" type="submit">
              Add New Idea
            </Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}

export default IdeasPopup
