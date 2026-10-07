export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}
export interface ProjectsResponse {
  projects: Project[];
  totalCount?: number;
}