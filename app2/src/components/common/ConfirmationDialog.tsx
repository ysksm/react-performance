import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'default' | 'danger' | 'warning';
}

const ConfirmationDialog = React.memo<ConfirmationDialogProps>((props) => {
  const {
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'default'
  } = props;
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          confirmButton: 'confirm-btn danger',
          icon: '⚠️'
        };
      case 'warning':
        return {
          confirmButton: 'confirm-btn warning',
          icon: '⚠️'
        };
      default:
        return {
          confirmButton: 'confirm-btn default',
          icon: '❓'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="confirmation-overlay">
      <div className="confirmation-dialog">
        <div className="dialog-header">
          <span className="dialog-icon">{styles.icon}</span>
          <h3 className="dialog-title">{title}</h3>
        </div>

        <div className="dialog-content">
          <p className="dialog-message">{message}</p>
        </div>

        <div className="dialog-actions">
          <button
            className="cancel-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
});

ConfirmationDialog.displayName = 'ConfirmationDialog';

export { ConfirmationDialog };