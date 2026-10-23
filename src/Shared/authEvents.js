// Event internal untuk memberi tahu komponen (mis. TanamanDetail/TernakDetail)
// bahwa status login berubah, tanpa perlu polling tiap 500ms.
export const emitAuthChange = () => {
  try {
    window.dispatchEvent(new Event("auth-change"));
  } catch (_) {
    /* abaikan */
  }
};
