import DeleteModal from '@/components/ui/DeleteModal';
import api from '@/lib/api';

export default function DeleteDebtModal({
  debt,
  onClose,
  onRefresh,
}: {
  debt: any;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const handleDelete = async () => {
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
