import { Database } from "./database"

export type Category = Database["public"]["Tables"]["categories"]["Row"]
export type Idea = Database["public"]["Tables"]["ideas"]["Row"]
export type Post = Database["public"]["Tables"]["posts"]["Row"]
export interface IdeaWithCategory extends Omit<Idea, "category"> {
  category: Category
}
export interface PostWithCategory extends Omit<Post, "category"> {
  category: Category
}
