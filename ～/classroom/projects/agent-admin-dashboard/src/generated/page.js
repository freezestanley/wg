export function mountPage({ container }) {
  container.innerHTML = `
    <main class="flex min-h-screen items-center justify-center bg-white px-6 text-center text-black">
      <p class="text-base font-medium tracking-[0.02em]">hello world</p>
    </main>
  `;
}
