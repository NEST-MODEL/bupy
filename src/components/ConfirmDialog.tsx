import { Modal } from './Modal';

export function ConfirmDialog({
  title, text, confirmLabel, danger, onConfirm, onClose,
}: { title: string; text: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-ink-soft">{text}</p>
      <div className="mt-5 flex flex-col gap-3">
        <button type="button" onClick={onConfirm} className={danger ? 'btn bg-berry-600 text-white hover:bg-berry-700' : 'btn-primary'}>
          {confirmLabel}
        </button>
        <button type="button" onClick={onClose} className="btn-secondary">Отмена</button>
      </div>
    </Modal>
  );
}
