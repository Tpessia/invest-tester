const serviceWorkerUrl = new URL('/service-worker.js?url', import.meta.url).href;

export function hasServiceWorker() {
  return 'serviceWorker' in navigator;
}

export async function registerWorker() {
  if (hasServiceWorker()) {
    const registration = await navigator.serviceWorker.register(serviceWorkerUrl);
    console.log('ServiceWorker registered!', registration, 'pushManager' in registration);

    navigator.serviceWorker.addEventListener('message', event => console.log(`PWA Message: ${event.data.msg}`));
    navigator.serviceWorker.controller?.postMessage({ msg: 'pwa:ping' });

    return registration;
  }
}

let installPrompt: any = null;

export async function installPWA() {
  console.log('Trigger install', installPrompt);

  if (installPrompt == null) return null;

  // Show the install prompt
  installPrompt.prompt();

  // Wait for the user to respond to the prompt
  const { outcome } = await installPrompt.userChoice;

  console.log(`User response to the install prompt: ${outcome}`);

  // We've used the prompt, and can't use it again, throw it away
  installPrompt = null;

  return outcome;
}

export function initInstallPWA() {
  window.addEventListener('beforeinstallprompt', e => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();

    // Stash the event so it can be triggered later
    installPrompt = e;

    console.log(`'beforeinstallprompt' event was fired`);
  });

  window.addEventListener('appinstalled', () => {
    // Clear the deferredPrompt so it can be garbage collected
    installPrompt = null;

    console.log('PWA was installed');
  });
}