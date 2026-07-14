import DeleteModal from '@/components/ui/DeleteModal';
import api from '@/lib/api';

export default function DeleteDebtModal({
  debt,
  onClose,
  onRefresh,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debt: any;
  onClose: () => void;
  onRefresh: () => void;
}) {
  async function handleDelete() {
    try {
      await api.delete(`/debts/${debt.id}`);
      onRefresh();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <DeleteModal
      isOpen={true}
      onClose={onClose}
      onConfirm={handleDelete}
      itemName={debt.name}
      itemType="debt"
    />
  );
}
