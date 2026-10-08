import TasksBoard from '@/src/components/tasks/TasksBoard';
import TasksPageHeader from '@/src/components/tasks/TasksPageHeader';

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <TasksPageHeader />
      {/* لا يوجد fetch ولا mock data: كل الأعمدة فارغة */}
      <TasksBoard />
    </div>
  );
}
