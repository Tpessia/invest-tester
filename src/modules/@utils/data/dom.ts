export function downloadObj(exportObj: any, exportName: string) {
  return new Promise<void>((resolve, reject) => {
    try {
      const jsonString: string = JSON.stringify(exportObj, null, 2);
      const dataStr: string = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`;
      const downloadAnchorNode: HTMLAnchorElement = document.createElement('a');
      downloadAnchorNode.setAttribute('href', dataStr);
      downloadAnchorNode.setAttribute('download', `${exportName}.json`);
      
      // Set up event listeners
      downloadAnchorNode.onload = () => {
        downloadAnchorNode.remove();
        resolve();
      };
      downloadAnchorNode.onerror = (error) => {
        downloadAnchorNode.remove();
        reject(error);
      };

      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
    } catch (error) {
      console.error('Error preparing JSON download:', error);
      reject(error);
    }
  });
}

export function loadScript(path: string, id?: string, classes?: string[]) {
  return new Promise<HTMLScriptElement>((res, rej) => {
    const script = document.createElement('script');

    if (id) script.id = id;
    if (classes?.length) script.classList.add(...classes);

    script.type = 'text/javascript';
    script.src = path;

    script.onload = () => res(script);
    script.onerror = rej;

    document.head.appendChild(script);
  });
}