<style>
  .headHeight {
    height: 70px;
  }
  .selectWidth {
    width: auto;
  }
</style>
<template>
  <div>
    <div id="head" class="line-small headHeight">
      <h1>Web数字谱转调器</h1>
    </div>
    <div id="body">
      <!--这里是主要操作区  -->
      <div class="line-small">
        <!-- 调式选择 -->
        <div class="xl6">
          <div class="form-inline float-right">
            <div class="form-group">
              <!-- 转调前 -->
              <select v-model="beforeMode" class="input border-blue selectWidth">
                <option v-for="(item, index) of modeMap" :value="index">1 = {{item}}</option>
              </select>
            </div>
            <span class="text-big padding">转</span>
            <div class="form-group">
              <!-- 转调后 -->
              <select v-model="afterMode" class="input border-blue selectWidth">
                <option v-for="(item, index) of modeMap" :value="index">1 = {{item}}</option>
              </select>
            </div>
          </div>
        </div>
        <div class="xl6">
          <!--转换按钮  -->
          <div class="float-right">
            <button @click="symbolConvert" class="button border-blue" type="button">高音 = {{this.isBracket}}</button>
            <button @click="start" class="button border-blue" type="button">开始转换</button>
          </div>
        </div>
      </div>
      <!-- ==========================分割线==========================  -->
      <div class="line-small margin-top">
        <!--转换与转换后显示内容  -->
        <div class="xs6">
          <!--输入文本  -->
          <textarea v-model="inputText" class="input" rows="20"></textarea>
        </div>
        <div class="xs6">
          <!-- 输出文本 -->
          <textarea v-model="outputText" class="input" rows='20' ></textarea>
        </div>
      </div>
    </div>
    <div id="foot">
      不明所以的页脚
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
      }
    },
    methods: {
      start () {// button绑定的方法
        let cacheText = this.baseFormat(this.inputText);
        let cacheTextArr = cacheText.match(/((#|b)[1-7])|[1-7]|.|\n/g);
        let inputTextArr = this.inputText.match(/((#|b)[1-7])|[1-7]|.|\n/g);
        let pairResult = this.pairCheck(cacheTextArr);
        let ok = this.inputCheck(inputTextArr, pairResult);
        cacheText = this.inputFormat(cacheTextArr, pairResult);
        cacheText = this.convert(cacheText);
        this.outputText = this.outputFormat(cacheText);
      },
      convert (text) {
        return text.replace(/((#|b)[1-7])|[1-7]/g, str => {
          let rule = this.beforeMode - this.afterMode;
          return this.convertImpl(str, rule, this.indexMap);
        });
      },
      convertImpl (str, rule, indexMap) {
        // 转换方法, 接收转换字符和转换规则转换后输出转换后字符
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
      pairCheck (textArr) {//检查输入谱是否有未配对括号标签, 如果有则提示，且标识出大致位置.并存入根配对标签下标。
        const stack1 = [], stack2 = [], error1 = [], error2 = [], save = [];
        for (let i = 0; i < textArr.length; i++) {//配对括号标签
          switch (textArr[i]) {
            case '[':
              stack1.push(i);
              break;
            case ']':
              stack1.length == 1 ? save.push({prefix: stack1[0], suffix: i}) : {};
              stack1.length > 0 ? stack1.pop() : error1.push(i);
              break;
            case '(':
              stack2.push(i);
              break;
            case ')':
              stack2.length == 1 ? save.push({prefix: stack2[0], suffix: i}) : {};
              stack2.length > 0 ? stack2.pop() : error2.push(i);
              break;
            default:
              break;
          }
        }
        return {textArr, stack1, stack2, error1, error2, save};
      },
      inputCheck (textArr, pairResult) {
        const resultArr = [...pairResult.stack1, ...pairResult.stack2, ...pairResult.error1, ...pairResult.error2];
        if (resultArr.length > 0) {
          alert('存在未闭合括号标签, 请检查、修改后转调。');
          for (let i = 0; i < resultArr.length; i++) {
            textArr[resultArr[i]] = ` ->${textArr[resultArr[i]]}<- `;
          }
          this.inputText = textArr.join('');//更新提示后的输入文本
          return false;
        } else {
          return  true;
        }
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
    },
  }
</script>
