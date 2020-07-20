<template>
  <figure align='center'>
    <img :src="imagesrc" alt="" :class="{'zoom': zoom}"/>
    <figcaption><i><small>{{ caption }}</small></i></figcaption>
  </figure>
</template>
<script>
export default {
  name: 'CImage',
  props: ['src', 'caption', 'zoom'],
  computed: {
    imagesrc () {
      return '/super-bowl/'+this.src
    }
  }
}
</script>
