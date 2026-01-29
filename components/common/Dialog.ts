import Swal from 'sweetalert2';

export const Dialog = {
  /**
   * 確認ダイアログを表示する
   * @returns true: 確認, false: キャンセル
   */
  async confirm(message: string, title = '確認'): Promise<boolean> {
    const result = await Swal.fire({
      title,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#2563eb',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'はい',
      cancelButtonText: 'キャンセル',
      reverseButtons: true,
    });
    return result.isConfirmed;
  },

  /**
   * 成功メッセージを表示する
   */
  async success(message: string, title = '成功'): Promise<void> {
    await Swal.fire({
      title,
      text: message,
      icon: 'success',
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'OK',
    });
  },

  /**
   * エラーメッセージを表示する
   */
  async error(message: string, title = 'エラー'): Promise<void> {
    await Swal.fire({
      title,
      text: message,
      icon: 'error',
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'OK',
    });
  },

  /**
   * 情報メッセージを表示する
   */
  async info(message: string, title = '情報'): Promise<void> {
    await Swal.fire({
      title,
      text: message,
      icon: 'info',
      confirmButtonColor: '#2563eb',
      confirmButtonText: 'OK',
    });
  },
};
