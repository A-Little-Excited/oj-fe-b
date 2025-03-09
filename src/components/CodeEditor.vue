<template>
  <div ref="editorform" class="ace-editor">
  </div>
</template>

<script setup>
// 代码编辑器子组件
import { ref, onMounted, onBeforeUnmount } from "vue"
import ace from "ace-builds"
import "ace-builds/src-noconflict/mode-java"
import "ace-builds/src-noconflict/theme-eclipse"
import "ace-builds/src-noconflict/ext-language_tools";

// 定义选项
const options = {
  theme: `ace/theme/eclipse`,
  mode: `ace/mode/java`,
  maxLines: 20,
  minLines: 10,
  fontSize: 15,
};
// 创建响应式引用
let editor = null;
// 通过 vue 提供的 defineEmits 自定义一个事件, 事件名称为 'update:value'
const emit = defineEmits(['update:value']);

const editorform = ref(null);
// 初始化编辑器
onMounted(() => {
  editor = ace.edit(editorform.value, options);
  editor.setOptions({
    enableBasicAutocompletion: true,
  });
  editor.getSession().on('change', () => {
    // 监听到编辑器内容变化时, 就会触发自定义事件并传递编辑器的内容给事件处理器
    emit('update:value', editor.getValue());
  });
});

// 销毁编辑器实例
onBeforeUnmount(() => {
  if (editor) {
    editor.destroy();
    editor = null;
  }
});

// 暴露该方法给父组件进行数据传递
function setAceCode(content) {
  // 将 content 赋值给编辑器
  editor.setValue(content)
}

defineExpose({
  setAceCode
})

</script>

<style lang="scss" scoped>
.ace-editor {
  margin: 10px 0 0 0;
  width: 90%;
}
</style>