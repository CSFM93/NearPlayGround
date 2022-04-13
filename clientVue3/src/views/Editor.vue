<template>
  <div class="">
    <codemirror
      :ref="editorKey"
      :id="editorKey"
      :value="text"
      :options="cmOptions"
      @ready="onCmReady"
      @focus="onCmFocus"
      @input="onCmCodeChange"
    />
  </div>
</template>

<script>
import actions from "../components/actions";

import { codemirror } from "vue-codemirror";

// import language js
import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/toml/toml.js";
import "codemirror/mode/rust/rust.js";

// import base style
import "codemirror/lib/codemirror.css";
// import theme style
import "codemirror/theme/dracula.css";
// import more 'codemirror/some-resource...'

export default {
  components: {
    codemirror,
  },
  props: ["editorKey", "text", "path", "extension", "readOnly", "options"],
  data: function () {
    return {
      code: "",
      saveText: false,
      cmOptions: {
        tabSize: 4,
        mode: "",
        theme: "dracula",
        lineNumbers: true,
        line: true,
        styleActiveLine: true,
        matchBrackets: true,
        gutter: ["CodeMirror-lint-markers"],
        lint: true,
        // more CodeMirror options...
      },
    };
  },
  created() {
    this.initialize();
  },
  methods: {
    initialize() {
      let files = {
        js: "text/javascript",
        ts: "text/typescript",
        json: "application/json",
        md: "text/markdown",
        txt: "ace/mode/text",
        toml: "text/x-toml",
        rs: "text/rust",
      };

      this.cmOptions.mode = files[this.extension.replace(".", "")];
    },
    onCmReady(cm) {
      console.log("options: ", this.$props);
      // this.cmOptions.mode = this.options.mode;
      // console.log("the editor is ready!", cm);
    },
    onCmFocus(cm) {
      // console.log("the editor is focused!", cm);
    },
    onCmCodeChange(newCode) {
      console.log("this is new code", newCode.length);
      this.code = newCode;
      this.debounce();
    },
    debounce() {
      let timeout = 200;
      this.saveText = true;
      console.log("debounce", this.saveText);

      setTimeout(() => {
        console.log("saving", this.saveText);

        if (this.saveText) {
          this.saveInput();
        } else {
          this.debounce();
        }
      }, timeout);
    },
    async saveInput() {
      let val = this.code;
      let data = {
        text: val,
        path: this.path,
      };
      console.log("saving data: ", this.code.length);
      actions.saveText(data).then((status) => {
        if (status === undefined) {
          let params = ["Error while trying to save file", "red", 3000];
          this.emitter.emit("showNotification", params);
        }
      });
    },
  },
  computed: {
    codemirror() {
      return this.$refs[this.editorKey].codemirror;
    },
  },
  mounted() {
    // console.log("the current CodeMirror instance object:", this.codemirror);
    let editor = this.$refs[this.editorKey].$el.lastChild;
    // console.log("editor: ", editor);
    // let unwantedClass = "cm-s-default";
    // editor.classList.remove(unwantedClass);
    // editor.classList.add("cm-s-base16-dark");
  },
};
</script>


<style >
.this.editorContainer {
  /* max-height: 100vh; */
  /* overflow-y: scroll; */
}

.CodeMirror {
  height: 75vh !important;
  overflow-x: scroll;
}

.editor {
  height: 140vh;
  z-index: 2;
  overflow-y: scroll;

  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>