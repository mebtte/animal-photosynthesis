---
title: 'init'
create: '2020-10-24'
updates:
hidden: false
---

## 上线步骤（假设今天是8月4日，上线时间是8月4日，用户需要的是7月1日之后的数据）：

#### 初始化数据：

ODS层：

1.ODS项目下找到 ods_trade_pcp_brand_sale_daily 工作流，点击下线，然后进行修改，初始化7月1日到8月3日的数据，将原来的${system.biz.curdate} 改为如图所示；

![c3b32e3fc771b49790159310613a5db](D:\工作脚本汇总\交接文档\picture\c3b32e3fc771b49790159310613a5db.png)

2.ODS项目下找到 ods_trade_wms_out_of_warehouse_daily 工作流，点击下线，然后进行修改，初始化7月1日到8月3日的数据，将原来的${system.biz.curdate} 改为如上图所示；



3.上面两个修改完成后都要点保存，然后上线启动工作流。当两个任务都跑完之后，下线改回原来的样子，重新上线并配置定时

至此数据初始化结束，7月1日到8月3日的历史数据有了，8月4日的数据将在8月5日凌晨跑数入表



dw层：

1.找到 dwa_trade_pcp_brand_sale_daily 任务，启动工作流

2.找到 dmp_trade_pcp_brand_sale_daily 任务，启动工作流，推送给pcp

