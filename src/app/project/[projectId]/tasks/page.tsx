import TasksBoard from '@/src/components/tasks/TasksBoard';
import TasksPageHeader from '@/src/components/tasks/TasksPageHeader';

export default function TasksPage() {
  return (
    // min-w-0 + w-full: ضروريان حتى يعمل الـ scroll الأفقي داخل الـ layout
    <div className="flex w-full min-w-0 flex-col gap-6 p-4 md:p-8">
      <TasksPageHeader />
      {/* لا يوجد fetch ولا mock data: كل الأعمدة فارغة */}
      <TasksBoard />
    </div>
  );
}
