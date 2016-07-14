<style>
  .selectWidth {
    width: auto;
  }
  textarea {
    resize: none;
    /*background-color: #D8BFD8;*/
  }
  textarea[readonly] {
    background-color: white;
    cursor: auto;
  }
</style>

<template>
  <div>
    <!--这里是主要操作区  -->
    <div class="line-small">
      <!-- 调式选择 -->
      <div class="xs6">
        <div class="form-inline float-left">
          <div class="form-group">
            <div class="input-group">
              <span class="addon">转调前</span>
              <select v-model="beforeMode" class="input selectWidth">
                <option v-for="(item, index) of modeMap" :value="index">1 = {{item}}</option>
              </select>
            </div>
          </div>
          <!-- <span class="text-big padding">转</span> -->
          <div class="form-group">
            <div class="input-group">
              <span class="addon">转调后</span>
              <select v-model="afterMode" class="input selectWidth">
                <option v-for="(item, index) of modeMap" :value="index">1 = {{item}}</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="xs6">
        <!--转换按钮  -->
        <div class="form-inline float-right">
          <!-- <button @click="symbolConvert" class="button" type="button">高音 = {{this.isBracket}}</button>
          <button @click="start" class="button" type="button">开始转换</button> -->
          <div class="form-group">
            <button @click="symbolConvert" class="button" type="button">高音 = {{this.isBracket}}</button>
          </div>
          <div class="form-group">
            <button @click="start" class="button" type="button">开始转换</button>
          </div>
        </div>
      </div>
    </div>
    <!-- ==========================分割线==========================  -->
    <div class="line-small margin-top">
      <!--转换与转换后显示内容  -->
      <div class="xs6 margin-bottom">
        <!--输入文本  -->
        <textarea v-model="inputText" @dblclick="selectAll($event)" class="input text-big text-black" rows="15" placeholder="输入, 双击全选"></textarea>
      </div>
      <div class="xs6 margin-bottom">
        <!-- 输出文本 -->
        <textarea v-model="outputText" @dblclick="selectAll($event)" class="input text-big text-black" rows='15' placeholder="输出, 双击全选" readonly="readonly"></textarea>
      </div>
    </div>
  </div>
</template>

<script>
  export default {
    data () {
      return {
        message: 'converter',
        modeMap: ['C', '#C', 'D', '#D', 'E', 'F', '#F', 'G', '#G', 'A', '#A', 'B'],
        indexMap: [
          ['1', '#7'], ['#1', 'b2'], ['2', ''], ['#2', 'b3'], ['3', 'b4'], ['4', '#3'],
          ['#4', 'b5'], ['5', ''], ['#5', 'b6'], ['6', ''], ['#6', 'b7'], ['7', 'b1'],
        ],
        isBracket: '[]',
        beforeMode: 0,
        afterMode: 0,
        inputText: '',
        outputText: '',
        cacheText: '',
        ok: true,
      }
    },
    methods: {
      start () {// button绑定的方法
        // this.allTextHandler();
        this.lineTextHandler();
      },
      lineTextHandler () {//以行为单位处理文本
        let cacheText = this.baseFormat(this.inputText);
        let arr1 = cacheText.split('\n');
        let arr2 = this.inputText.split('\n');
        const error = [];
        for (let i = 0; i < arr1.length; i++) {//把输入按行分割，检查每行书否正确配对，并初始化每行的输入。
          let cacheTextArr = arr1[i].match(/((#|b)[1-7])|[1-7]|.|\n/g);
          let inputTextArr = arr2[i].match(/((#|b)[1-7])|[1-7]|.|\n/g);
          let pairResult = this.pairCheck(cacheTextArr);
          error.push(...pairResult.stack1, ...pairResult.stack2, ...pairResult.error);
          arr2[i] = this.inputCheck(inputTextArr, pairResult);
          arr1[i] = this.inputFormat(cacheTextArr, pairResult);
        }
        if (error.length > 0) {
          alert('存在未正确闭合的括号标签\n转调结果将会异常, 请检查、修改后转调。');
        }
        this.inputText = arr2.join('\n');//更新输入文本
        cacheText = arr1.join('\n');
        cacheText = this.convert(cacheText);
        this.outputText = this.outputFormat(cacheText);
      },
      allTextHandler () {//全文本为单位处理
        let cacheText = this.baseFormat(this.inputText);
        let cacheTextArr = cacheText.match(/((#|b)[1-7])|[1-7]|.|\n/g);
        let inputTextArr = this.inputText.match(/((#|b)[1-7])|[1-7]|.|\n/g);
        let pairResult = this.pairCheck(cacheTextArr);
        const error = [...pairResult.stack1, ...pairResult.stack2, ...pairResult.error];
        if (error.length > 0) {
          alert('存在未正确闭合的括号标签\n转调结果将会异常, 请检查、修改后转调。');
        }
        this.inputText = this.inputCheck(inputTextArr, pairResult);
        cacheText = this.inputFormat(cacheTextArr, pairResult);
        cacheText = this.convert(cacheText);
        this.outputText = this.outputFormat(cacheText);
      },
      convert (text) {//转换方法, 调用转换实现方法
        return text.replace(/((#|b)[1-7])|[1-7]/g, str => {
          let rule = this.beforeMode - this.afterMode;
          return this.convertImpl(str, rule, this.indexMap);
        });
      },
      convertImpl (str, rule, indexMap) {// 转换实现方法, 接收转换字符和转换规则转换后输出转换后字符
        let strIndex;//定义待转音级下标容器
        for (let i = 0; i < indexMap.length; i++) {// 获取音级在逻辑音程表(indexMap)中的位置
            // for (let j = 0; j < indexMap[i].length; j++) {
            //   if (indexMap[i][j] === str) {
            //     strIndex = i;
            //     break;
            //   }
            // }
            let str2 = indexMap[i];
            strIndex = str2[0] === str | str2[1] === str ? i : null;
            if (strIndex !== null) {
              break;
            }
        }
        //开始处理转调
        let total = strIndex + rule;
        let range = total > 11 ? 'high' : total < 0 ? 'low' : 'middle';// 检查转调后是否超出所在音组
        let resultIndex = total > 11 ? total - 12 : total < 0 ? total + 12 : total;
        let result = indexMap[resultIndex][0];//获取转调后音名
        // 处理转调后音组
        let Hprefix, Hsuffix, Lprefix, Lsuffix;//定义高低音前后缀容器;
        if (this.isBracket === '[]') { //[] = 高音
          Hprefix = '[';
          Hsuffix = ']';
          Lprefix = '(';
          Lsuffix = ')';
        } else { //() = 高音
          Hprefix = '(';
          Hsuffix = ')';
          Lprefix = '[';
          Lsuffix = ']';
        }
        if (range === 'high') {
          result = Hprefix + result + Hsuffix;
        } else if (range === 'low') {
          result = Lprefix + result + Lsuffix;
        }
        return result;
      },
      baseFormat (text) {
        return text.replace(/（|）|【|】/g, str => {//替换掉中文括号
          return str === '（' ? '(' : str === '【' ? '[' : str === '）' ? ')' : str === '】' ? ']' : 'Format error';
        });
      },
      subPairFun (a, b, error, save, i) {//抽取出的配对检测的公用逻辑
        if (a.length > 0) {
          let cacheArr = [];
          for (let j = 0; j < b.length; j++) {
            if (b[j] > a[a.length - 1] && b[j] < i) {
              error.push(b[j]);
              cacheArr.push(b[j]);
            }
          }
          for (let i = 0; i < cacheArr.length; i++) {
            for (let j = 0; j < b.length; j++) {
              if (b[j] === cacheArr[i]) {
                b.splice(j, 1);
                break;
              }
            }
          }
          a.length == 1 ? save.push({prefix: a[0], suffix: i}) : {};
          a.pop();
        } else {
          error.push(i);
        }
      },
      pairCheck (textArr) {//检查输入谱是否有未配对括号标签, 如果有则保存, 并存入根配对标签下标。
        const stack1 = [], stack2 = [], error = [], save = [];
        for (let i = 0; i < textArr.length; i++) {//配对括号标签
          switch (textArr[i]) {
            case '[':
              stack1.push(i);
              break;
            case ']':
              this.subPairFun(stack1, stack2, error, save, i);
              // stack1.length == 1 ? save.push({prefix: stack1[0], suffix: i}) : {};
              // stack1.length > 0 ? stack1.pop() : error1.push(i);
              break;
            case '(':
              stack2.push(i);
              break;
            case ')':
              this.subPairFun(stack2, stack1, error, save, i);
              // stack2.length == 1 ? save.push({prefix: stack2[0], suffix: i}) : {};
              // stack2.length > 0 ? stack2.pop() : error2.push(i);
              break;
            default:
              break;
          }
        }
        return {stack1, stack2, error, save};
      },
      inputCheck (textArr, pairResult) {//根据配对检测结果对未配对标签添加提示, 返回提示后文本
        const resultArr = [...pairResult.stack1, ...pairResult.stack2, ...pairResult.error];
        if (resultArr.length > 0) {
          for (let i = 0; i < resultArr.length; i++) {
            textArr[resultArr[i]] = `>${textArr[resultArr[i]]}`;
          }
        }
        return textArr.join('')//返回添加提示后的输入文本
      },
      inputFormat (textArr, pairResult) {//处理输入数字谱格式
        const pairArr = pairResult.save;
        for (let i = 0; i < pairArr.length; i++) {
          let prefixIndex = pairArr[i].prefix, suffixIndex = pairArr[i].suffix;
          let flag = textArr[prefixIndex] + textArr[suffixIndex];//稍微生成下判断用标识
          if ((suffixIndex - prefixIndex) > 1) {//如果标签之间非空。
            // 去掉前后缀
            textArr[prefixIndex] = '';
            textArr[suffixIndex] = '';
            for (let i = prefixIndex + 1; i < suffixIndex; i++) {
              let ok = /((#|b)[1-7])|[1-7]/.test(textArr[i]);
              textArr[i] = ok ? flag === '[]' ? `[${textArr[i]}]` : `(${textArr[i]})` : textArr[i];
            }
          }
        }
        return textArr.join('');
      },
      outputFormat (text) {//处理输出数字谱格式
        // [()] ([]) <- 去掉
        text = text.replace(/\[\(|\)\]|\(\[|\]\)/g, '');
        let ok = /\]\[|\)\(/.test(text);
        while (ok) {
          text = text.replace(/\]\[|\)\(/g, '');
          ok = /\]\[|\)\(/.test(text);
        }
        return text;
      },
      symbolConvert () {// () [] 高低音标识符互转
        this.isBracket = this.isBracket === '[]' ? '()' : '[]';
      },
      selectAll (event) {//文本全选
        event.target.select();
      },
    },
  }
</script>
