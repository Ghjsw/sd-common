<template>
    <div class="data-empty">
        <div class="img">
            <img :src="url" alt="">
        </div>
        <div class="text">{{text}}</div>
    </div>
</template>

<script>
export default {
  name: 'DataEmpty',
  props: {
    text: {
      type: String,
      default: '暂无数据'
    }
  },
  data() {
    return {
      url: require('./assets/data-empty.png')
    };
  }
};
</script>

<style lang="less" scoped>
.data-empty {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items:center;
    justify-content:center;
    margin: 30px;
    .img {
        width: 74px;
        height: 84px;
        img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
    .text {
        font-size: 14px;
        color: #A2ACBA;
        display: flex;
        justify-content: center;
        align-items: center;
        line-height: 1;
    }
}
</style>
