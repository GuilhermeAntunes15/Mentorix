export function printHtmlDocument(html: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.setAttribute('aria-hidden', 'true');

  const cleanup = () => {
    window.setTimeout(() => {
      iframe.remove();
    }, 500);
  };

  iframe.onload = () => {
    const targetWindow = iframe.contentWindow;

    if (!targetWindow) {
      cleanup();
      throw new Error('Nao foi possivel preparar a impressao do documento.');
    }

    const afterPrintHandler = () => {
      targetWindow.removeEventListener('afterprint', afterPrintHandler);
      cleanup();
    };

    targetWindow.addEventListener('afterprint', afterPrintHandler);
    targetWindow.focus();
    targetWindow.print();
  };

  document.body.appendChild(iframe);

  const documentRef = iframe.contentDocument;
  if (!documentRef) {
    cleanup();
    throw new Error('Nao foi possivel montar o documento para impressao.');
  }

  documentRef.open();
  documentRef.write(html);
  documentRef.close();
}
