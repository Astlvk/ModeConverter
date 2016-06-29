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
          <textarea v-model="outputText" class="input" rows='20' readonly></textarea>
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
        indexMap2: [
          {a: '1', b: '#7', i: 0}, {a: '#1', b: 'b2', i: 1}, {a: '2', b: '', i: 2},
          {a: '#2', b: 'b3', i: 3}, {a: '3', b: 'b4', i: 4}, {a: '4', b: '#3', i: 5},
          {a: '#4', b: 'b5', i: 6}, {a: '5', b: '', i: 7}, {a: '#5', b: 'b6', i: 8},
          {a: '6', b: '', i: 9}, {a: '#6', b: 'b7', i: 10}, {a: '7', b: 'b1', i: '11'},
        ],
        // isBracket: true,
        isBracket: '[]',
        beforeMode: 0,
        afterMode: 0,
        inputText: '',
        outputText: '',
      }
    },
    methods: {
      start () {// button绑定的方法
        this.inputCheck(this.inputText);
        this.convert(this.inputFormat(this.inputText));
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
      inputCheck (inputText) {//检查输入谱是否有未配对括号标签, 如果有则提示，且标识出大致位置.
        let cacheText = this.baseFormat(inputText);
        const textArr = [...cacheText];//转成数组.
        const stack1 = [], stack2 = [], error1 = [], error2 = [];
        for (let i = 0; i < textArr.length; i++) {//配对括号标签
          switch (textArr[i]) {
            case '[':
              stack1.push(i);
              break;
            case ']':
              stack1.length > 0 ? stack1.pop() : error1.push(i);
              break;
            case '(':
              stack2.push(i);
              break;
            case ')':
              stack2.length > 0 ? stack2.pop() : error2.push(i)
              break;
            default:
              break;
          }
        }
        const resultArr = [...stack1, ...stack2, ...error1, ...error2];
        if (resultArr.length > 0) {
          alert('存在未闭合括号标签');
          for (let i = 0; i < resultArr.length; i++) {
            textArr[resultArr[i]] = ` ->${textArr[resultArr[i]]}<- `;
          }
          this.inputText = textArr.join('');//更新提示后的输入文本
        }
      },
      inputFormat (inputText) {//处理输入数字谱格式
        return this.baseFormat(inputText);
      },
      outputFormat (resultText) {//处理输出数字谱格式
        return resultText.replace(/\[.*\(.*\]/g, str => {

        });
      },
      symbolConvert () {// () [] 高低音标识符互转
        this.isBracket = this.isBracket === '[]' ? '()' : '[]';
      }
    },
  }
</script>
