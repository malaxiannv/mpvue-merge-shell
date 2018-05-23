# mpvue-merge-shell
mpvue和第三方框架合并打包脚本

# 此脚本实现的功能：

1.自动化编译mpvue项目和第三方项目

2.把编译后的两个项目合并

3.合并后修改app.json文件，支持小程序分包

# 此脚本的使用方法：

把build文件夹和merge.config.json文件拷贝到你的mpvue项目中，安装所需的npm包
按照如下提示修改merge.js文件，修改完毕，执行npm run merge即可。

# 需要修改的merge.js中的几个地方：

1.把mpvue的项目名称修改成你自己的项目名，此处我使用的是mpvue_project

2.把第三方项目的名称修改为你自己的项目名，此处我使用的是projectB

3.把这两个项目放在同级的目录中,否则你需要修改merge.js中的迁移路径

4.把其中的编译命令修改成你自己第三方的编译命令，此处我使用的是'npm run build-online'

#在mpvue项目中创建一个merge.config.json文件，用于配置mpvue的pages在合并后的app.json文件中的配置，此文件的配置规则如下：


1.需要放在小程序首页的路径，前面加个尖号标识，其余路径正常书写， 如下：

``` bash
{
  "pages": [
    "^mp-pages/pages/index/index",
    "mp-pages/test/test/test"
  ]
}
```
2.需要做小程序异步加载的页面配置在'subPackages'字段中，如下：

``` bash
{
  "pages": [
    "^mp-pages/pages/index/index",
    "mp-pages/test/test/test"
  ],
  "subPackages": [
    {
      "root": "mp-pages/pages/ucenter",
      "pages": [
        "mp-pages/pages/ucenter/ucenter"
      ]
    }
  ]
}
```
