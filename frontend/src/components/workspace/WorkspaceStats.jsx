
import {
  BookOpen,
  Bookmark,
  FolderOpen
} from "lucide-react";

export default function WorkspaceStats({ documents }) {

  const bookmarked = documents.filter(
    (doc) => doc.bookmarked
  ).length;

  const categories = new Set(
    documents.map((doc) => doc.category)
  ).size;

  const stats = [
    {
      title: "Saved Documents",
      value: documents.length,
      icon: BookOpen
    },
    {
      title: "Bookmarks",
      value: bookmarked,
      icon: Bookmark
    },
    {
      title: "Collections",
      value: categories,
      icon: FolderOpen
    }
  ];

  return (
    <div className="workspace-stats">

      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div className="workspace-stat-card" key={stat.title}>

            <div className="workspace-stat-icon">
              <Icon size={20} />
            </div>

            <div>
              <h2>{stat.value}</h2>
              <p>{stat.title}</p>
            </div>

          </div>
        );
      })}

    </div>
  );
}
