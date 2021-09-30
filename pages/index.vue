<template>
  <div class="bg-gray-300 min-h-screen">
    <div class="md:h-[1000px] lg:h-[1200px]">
      <div class="bg-cover bg-center" style="background-image: url('bg2.jpg')">
        <div class="bg-gray-800 bg-opacity-50">
          <div class="container py-4 lg:py-12 flex flex-col justify-between md:h-[660px] lg:h-[860px]">
            <div class="flex flex-col md:flex-row justify-between items-center">
              <NuxtLink class="flex items-center" to="/">
                <svg class="w-12 lg:w-18 mr-2 lg:mr-4 transform rotate-180" xmlns="http://www.w3.org/2000/svg" viewBox="299.2254999999999 397.8038000000001 401.5409999999997 315.357">
                  <path d="M681.4395 530.5928c-7.576-21.18-23.963-33.328-44.96-33.328h-18.151v112.545h18.151c21.275 0 37.716-11.724 45.097-32.154 2.644-7.197 4.042-15.312 4.042-23.47 0-7.84-1.446-16-4.179-23.593m-75.959 135.162c-7.915 8.056-19.048 12.674-30.542 12.674h-149.887c-11.521 0-22.373-4.506-30.57-12.702-8.054-7.915-12.673-19.05-12.673-30.544v-10.081h-20.884v6.767c0 16.855 4.4 31.759 12.705 43.07 8.861 12.406 22.551 20.08 39.548 22.186 3.465.494 7.073.744 10.721.744h152.193c3.651 0 7.258-.25 10.676-.739 17.198-2.114 30.564-9.575 39.732-22.182 8.075-11.192 12.386-25.775 12.538-42.2v-7.646h-20.709v10.081c0 11.407-4.672 22.539-12.848 30.572m-2.589-105.796h-34.725c-3.014 0-5.535-1.517-6.994-4.303l-13.465-22.148-22.213 54.207c-.713 2.139-2.207 3.759-4.265 4.582-.946.405-1.942.61-2.963.61-3.04 0-5.763-1.822-6.945-4.661l-22.973-53.708-24.537 72.2c-.056.167-.113.305-.168.443-.089.222-.177.444-.268.713-.149.449-.573.983-.948 1.456-1.04 1.171-2.14 1.955-3.269 2.33-.882.293-1.788.444-2.695.444-1.081 0-2.116-.217-2.937-.599-.734-.368-1.369-.685-1.814-1.128l-.107-.108-.121-.092c-.841-.657-1.648-1.84-2.224-3.214l-16.72-47.024h-35.441v75.224c0 7.33 2.992 14.526 8.21 19.743 5.219 5.219 12.415 8.21 19.742 8.21h149.887c7.437 0 14.448-2.915 19.744-8.21 5.217-5.217 8.209-12.413 8.209-19.743zm0-74.664c0-7.436-2.915-14.447-8.209-19.74-5.293-5.296-12.305-8.211-19.744-8.211h-39.921c-1.392 0-2.963-.491-4.376-1.388l-66.669-37.071v30.812c0 4.217-3.43 7.647-7.646 7.647h-31.275c-7.33 0-14.527 2.994-19.742 8.211-5.294 5.293-8.21 12.304-8.21 19.74v59.371h40.923c3.481 0 6.413 2.226 7.358 5.735l11.015 30.656 23.847-70.429c1.131-3.13 4.093-5.234 7.373-5.234.81 0 1.618.129 2.349.365 2.055.721 3.794 2.395 4.758 4.561l23.484 55.12 20.858-51.268c.56-1.679 1.688-3.065 3.272-4.014 1.217-.739 2.606-1.128 4.014-1.128 2.677 0 5.094 1.352 6.473 3.628l19.595 32.008h30.473zm-221.083 11.97h-18.153c-20.777 0-37.639 12.459-45.103 33.323-2.639 7.333-4.034 15.493-4.034 23.598 0 8.537 1.31 16.435 3.892 23.457 7.386 20.443 23.878 32.167 45.245 32.167h18.153zm314.203 85.493c-7.253 20.099-21.476 34.198-40.049 39.706l-1.604.476v8.929c0 20.138-5.369 38.127-15.537 52.044-11.508 15.991-28.816 25.811-50.081 28.404-4.197.561-8.452.844-12.649.844h-152.193c-4.196 0-8.45-.283-12.673-.846-21.387-2.624-38.231-12.184-50.065-28.417-10.158-13.902-15.527-31.891-15.527-52.029v-8.973l-1.465-.432c-18.724-5.515-32.942-19.61-40.054-39.735-3.244-8.649-4.889-18.252-4.889-28.543 0-9.727 1.696-19.662 4.9-28.717 9.951-27.644 31.649-43.496 59.53-43.496h18.15l.271-2.135c1.207-9.522 5.612-18.43 12.419-25.099 8.183-8.181 19.035-12.687 30.556-12.687h23.774l-.006-36.062c-.112-1.572.223-3.077.965-4.35 1.413-2.402 3.883-3.836 6.609-3.836 1.354 0 2.688.375 3.876 1.095l76.816 43.153h37.853c11.494 0 22.627 4.618 30.575 12.706 6.79 6.65 11.196 15.558 12.401 25.08l.27 2.135h18.295c27.789 0 49.435 15.852 59.382 43.484 3.209 9.065 4.905 18.999 4.905 28.765.138 9.627-1.508 19.496-4.755 28.536" fill="#db2777"/>
                </svg>
                <div class="flex flex-col">
                  <div class="text-lg lg:text-2xl uppercase text-pink-600 leading-none tracking-wider">
                    Audio<span class="text-gray-300 dark:text-gray-400">Silo</span>
                  </div>
                  <div class="hidden lg:block leading-none text-xs text-gray-300 text-opacity-80">
                    Powered by Audioserve
                  </div>
                </div>
              </NuxtLink>
              <div class="text-gray-300">
                <span @click="demo = true" class="mx-5 cursor-pointer">Demo</span>
                <a class="mx-5" href="https://github.com/KodeStar/audiosilo" target="_blank">Code</a>
                <a class="mx-5" href="https://discord.gg/vfQMqkzQrf" target="_blank">Support</a>
              </div>
            </div>
            <div class="flex flex-col justify-evenly mt-12 items-center">
              <div class="text-gray-300 text-opacity-80 text-center rounded p-4">
                <p>Built <span class="text-pink-600">by</span> audiobook lovers <span class="text-pink-600">for</span> audiobook lovers</p>
                <vue-typed-js
                  :loop="true"
                  class="w-full justify-center"
                  :strings="['Audiobook player', 'Audible replacement', 'Audiobook player']"
                  :typeSpeed="60"
                  :backDelay="1000"
                  :loopCount="2"
                  :startDelay="1000"
                >
                  <h1 class="text-5xl my-12 font-extrabold justify-content: center;">Muti-platform <span class="typing inline-block text-pink-600"></span></h1>
                </vue-typed-js>
                <div class="max-w-3xl mb-8">
                  <p class="mb-2 text-lg leading-loose">Audiosilo is a multi-platform audiobook player. It should run on anything that can install a PWA and includes variable playback speed, sleep timer, light and dark themes, bookmarks and listening history.</p>
                </div>
              </div>
              <div class=""><img src="laptop.png" alt="" /></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div class="container py-12 flex flex-col md:flex-row justify-center">
        <div class="bg-gray-200 rounded max-w-sm m-3 py-8">
          <div class="p-4 px-8 text-lg font-semibold rounded-t">
            Powered by Audioserve
          </div>
          <div class="p-4 px-8">
            <p class="mb-4">Audioserve is an open source audio server designed primarily for audiobooks.</p>
            <p class="mb-4">Built with Rust, it's the perfect backend server to handle your books.</p>
            <p>It's small, light on resources, and built with purpose.</p>
          </div>
        </div>

        <div class="bg-gray-200 rounded max-w-sm m-3 py-8">
          <div class="p-4 px-8 text-lg font-semibold rounded-t">
            Purpose built
          </div>
          <div class="p-4 px-8">
            <p class="mb-4">This isn't a repurposed music player, both the server and player have being built specifically with audiobooks in mind.</p>
            <p>Stream your books to any device, or download them from offline use.</p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="demo===true" class="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center">
      <div class="rounded-lg flex border border-gray-700 text-gray-300 bg-gray-800 flex-col p-4 lg:p-8 w-full max-w-lg m-4 relative">
        <span @click="demo = false" class="text-gray-300 p-3 absolute top-0 right-0 cursor-pointer"><i class="fa-fw fa-solid fa-times"></i></span>
        <div class="flex justify-center mb-5 text-gray-300 font-bold text-xl">
          Demo site details
        </div>
        <div class="rounded my-3 lg:my-1 flex flex-col lg:flex-row items-center"><span class="bg-gray-700 flex p-3 w-full lg:w-32 rounded justify-center lg:mr-2">Server</span><span class="flex"><span class="bg-gray-900 flex w-[264px] p-3 rounded justify-center mr-2">https://audioserve.zderadicka.eu/</span><span @click="copyURL('https://audioserve.zderadicka.eu/')" class="cursor-pointer bg-pink-600 flex items-center p-3 rounded justify-center"><i class="fa-light fa-copy"></i></span></span></div>
        <div class="rounded my-3 lg:my-1 flex flex-col lg:flex-row items-center"><span class="bg-gray-700 flex p-3 w-full lg:w-32 rounded justify-center lg:mr-2">Shared Secret</span><span class="flex"><span class="bg-gray-900 flex w-[264px] p-3 rounded justify-center mr-2">mypass</span><span @click="copyURL('mypass')" class="cursor-pointer bg-pink-600 flex items-center p-3 rounded justify-center"><i class="fa-light fa-copy"></i></span></span></div>
        <div class="rounded my-3 lg:my-1 flex flex-col lg:flex-row items-center"><span class="bg-gray-700 flex p-3 w-full lg:w-32 rounded justify-center lg:mr-2">User/Group</span><span class="bg-gray-900 flex w-full lg:w-[264px] p-3 rounded justify-center lg:mr-2 text-gray-700 italic">Anything you want</span></div>
        <a class="bg-pink-600 text-white w-full mt-3 p-3 rounded text-center text-lg" href="https://client.audiosilo.app/" target="_blank">
          Go to demo site
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [],
  data () {
    return {
      demo: false
    }
  },
  methods: {
    async copyURL (mytext) {
      try {
        await navigator.clipboard.writeText(mytext)
        alert('Copied')
      } catch ($e) {
        alert('Cannot copy')
      }
    }
  }
}
</script>
