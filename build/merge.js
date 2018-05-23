var shell = require('shelljs')
var chalk = require('chalk')
var fs = require('fs')
var path = require('path')


/**
 * 判断当前分支是否是dev分支，是的话执行callback1，不是的话执行callack2
 */
function isDev(callback1, callback2) {
  let currentBranch = String(shell.exec('git symbolic-ref --short -q HEAD'))
  if (currentBranch.trim() === 'dev') {
    callback1()
  } else {
    callback2()
  }
}

/**
 * 输出错误信息提示，并退出脚本
 */
function printError(error) {
  shell.echo(error)
  shell.exit(1)
}

/**
 * 1. 编译老项目，并把新项目编译文件拷贝到老项目中
 * 2. 读取merge.config.js文件，并去修改老项目的app.json文件
 */
function mergeFiles() {
  let { code } = shell.exec('npm run build-online')
  if (code === 0) {
    // 切回新项目
    shell.cd('../mpvue_project')
    // 复制编译好的文件到老项目
    shell.cp('-R', 'mp-pages', '../projectB/dist')

    //修改json文件，通过路径开头是否有^来决定是否把这个page路径放在pages数组第一行
    let { pages, subPackages } = JSON.parse(shell.cat('merge.config.json').stdout)
    const oldPath = path.join(__dirname, '../../projectB/dist/app.json')
    let oldConfig = JSON.parse(shell.cat(oldPath).stdout)
    // 遍历pages，把以^开头的插入数组第一位，其他都append在数组末尾
    if (pages && pages.length) {
      pages.forEach((page) => {
        if (page.trim()[0] === '^') {
          oldConfig.pages.unshift(page.trim().slice(1))
        } else {
          oldConfig.pages.push(page)
        }
      })
    }
    if (subPackages && subPackages.length) {
      oldConfig.subPackages = subPackages
    }
    const newConfig = new Buffer(JSON.stringify(oldConfig, null, 2))
    fs.writeFile(oldPath, newConfig, {flag: 'w+'}, function (err) {
      if(err) {
        console.log(chalk.red('projectB中的app.json文件修改失败，请手动修改'))
      } else {
        console.log(chalk.green('\n 乾坤大挪移果然天下无敌，哈哈哈合并成功啦！'))
      }
    })
  } else {
    printError('projectB error: npm run build-online failed')
  }
}


/**
 * 1. 判断是dev分支的话，执行npm run simple编译项目
 * 2. 编译失败就打出错误信息并退出脚本，编译成功就进入老项目目录
 * 3. 检查老项目分支是否是dev分支
 *    如果是dev分支:
 *        3.1 在老项目中执行编译命令来生成dist文件
 *        3.2 切回新项目，把新项目的编译文件夹拷贝到老项目的dist文件夹下
 *    如果不是dev分支:
 *        切换到dev分支，执行3.1和3.2
 * 4. 文件拷贝完成后，修改老项目的app.json文件
 */
isDev(() => {
  let { code } = shell.exec('npm run simple')
  if (code === 0) {
    shell.cd('../projectB')
    isDev(() => {
      mergeFiles()
    }, () => {
      let { code } = shell.exec('git checkout dev')
      if (code === 0) {
        mergeFiles()
      } else {
        console.log(chalk.red('projectB当前分支有修改，请提交修改后重新执行npm run merge'))
      }
    })
  } else {
    printError('projectB error: npm run build-online failed')
  }
}, () => {
  console.log(chalk.red('请先切换到dev分支再执行npm run simple'))
})
