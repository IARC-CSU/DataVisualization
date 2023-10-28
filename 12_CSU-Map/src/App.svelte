<script>
  import svelteLogo from './assets/svelte.svg'
  import iarcLogo from './assets/iarc-logo.svg'
  import Counter from './lib/Counter.svelte'

  let test = "Hello all"
</script>

<main>

  <article id="intro">
    <div class="container">
      <a href="https://vitejs.dev" target="_blank"> 
        <img src="/vite.svg" class="logo" alt="Vite Logo" />
      </a>
      <a href="https://svelte.dev" target="_blank"> 
        <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
      </a>
    </div>
    <h1>CSU Map generator</h1>

      <!--<div class="card">
        <Counter />
      </div>-->

    <p>
      The map is using standard operating procedures for WHO maps. <br/>For more information, please follow this link: <a href="https://intranet.who.int/sites/ghogis/sops/maps/index.shtml" target="_blank">https://intranet.who.int/sites/ghogis/sops/maps/index.shtml</a>
    </p>

    <p class="read-the-docs">
      Click on the Vite and Svelte logos to learn more or
      <br><br>
      <button><a href="#map">Start using the app</a></button>
    </p>
  </article>

  <article id="map">

    <div id="container-map">
      { test }
    </div>

  </article>

</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
