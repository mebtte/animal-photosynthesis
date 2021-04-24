---
title: 'Hive 知识点总结'
create: '2020-10-24'
updates:
hidden: false
---



## 什么是 Hive

hive 的本质是将 HQL 转化为 MapReduce 程序，hive 处理的数据存储在 HDFS 上，hive 分析数据的底层实现是 MapReduce，hive 会将 HQL 代码提交到 Yarn 上执行。

hive的元数据信息存储在远程的 mysql 数据库中，元数据包括：表名、表所属的数据库（默认是 default）、表的拥有者、列/分区字段、表的类型（是否是外部表）、表的数据所在目录等； 



## Hive 的内部表、外部表、分区表、分桶表

### 什么是 hive 的内部表：

每一张 Table 在 hive 中都有一个相对应的目录存储数据，所有的 Table 数据（不包括 External table ）都保存在这个目录中，删除表时，元数据和表数据都会被删除。

```sql
create table emp (
empid int, 
ename string,  
deptno int 
)row format delimited fields terminated by ',';
```


### 将数据导入内部表：

- 标准insert语句，用于从textfile类型临时表导数到orc压缩格式的表中

  ```
  insert into emp values(列值,列值,列值)
  ```

- load 语句

  导入 HDFS 的数据：

  ```
  load data inpath '/scott/emp.csv' into table emp;
  ```

  导入本地数据文件，多一个 local 关键字：

  ```
  load data local inpath '/root/temp/emp.csv' into table emp;
  ```

  覆盖数据，overwrite 关键字：

  ```
  load data inpath '/scott/emp.csv' overwrite into table emp;
  ```

  加载数据到分区，partition 指定分区：

  ```
  load data local inpath '/opt/module/hive/datas/dept_20200401.log' into table dept_partition partition(day='20200401');
  ```



### 什么是 hive 的外部表

外部表只是表与外部数据做一个链接，链接指明数据存在HDFS的什么地方，数据不存储在表所对应的目录下。当删除一个外部表时，仅删除该链接和元数据，不删除外部数据。

external 关键字可以让用户创建一个外部表，location 关键字指向实际路径

```
create external table emp (
empid int, 
ename string,  
deptno int 
)row format delimited fields terminated by ',';
location '/emp';
```



### 外部表和内部表的互换：

- 修改内部表 student 为外部表

  ```
  alter table student set tblproperties('EXTERNAL'='TRUE');  
  ```

- 修改外部表 student 为内部表

  ```
  alter table student set tblproperties('EXTERNAL'='FALSE');  
  ```

  


### 什么是 hive 的分区表：

在 Hive 中，表中的一个 partition 对应表下的一个目录，所有的 partition 数据都存储在对应的目录中。

partitioned by 创建分区表 :

```
create table emp_part (
empno int,
ename string, 
job string,
mgr int, 
hiredate string, 
sal int, comm int 
)partitioned by (deptno int) 
row format delimited fields terminated by ',';
```

通过 explain 语句，可以查看 SQL 的执行计划。从而可以判断建立分区后，是否可以提高查询到的效率：

```
explain select * from emp where deptno = 10;
```

往分区表中插入数据：指明分区：

```
insert into table emp_part partition(deptno=10) select empno,ename,job,mgr,hiredate,sal,comm from emp1 where deptno=10;
insert into table emp_part partition(deptno=20) select empno,ename,job,mgr,hiredate,sal,comm from emp1 where deptno=20;
insert into table emp_part partition(deptno=30) select empno,ename,job,mgr,hiredate,sal,comm from emp1 where deptno=30;
```

创建二级分区表：

```
 create table dept_partition2(
 deptno int, 
 dname string, 
 loc string
 )partitioned by (day string, hour string)
 row format delimited fields terminated by '\t'; 
```



### 什么是 hive 的分桶表？

桶表是对数据进行哈希取值，然后放到不同文件中存储

clustered by 创建分桶表

```
create table emp_bucket 
(empno int, 
ename string, 
job string, 
mgr int, 
hiredate string, 
sal int, 
comm int, 
deptno int 
)clustered by (job) into 4 buckets 
row format delimited fields terminated by ',';
```



### STORED AS 为 hive 表指定存储文件类型 

常用的存储文件类型：SEQUENCEFILE（二进制序列文件）、TEXTFILE（文本）、ORC（列

式存储格式文件）。如果文件数据是纯文本，可以使用STORED AS TEXTFILE。如果数据需要压缩，使用 STORED 

AS ORC



## 表的常用操作

1.重命名表：

```
ALTER TABLE table_name RENAME TO new_table_name; 
```

2.添加列：

```
 alter table tableName add columns (deptdesc string);  
```

3.更新列：

```
 alter table tableName change column column_name new_name string;  
```

4.增加分区：

```
alter table dept_partition add partition(day='20200404');  
alter table dept_partition add partition(day='20200405') partition(day='20200406');  
```

5.删除分区：

```
alter table dept_partition drop partition (day='20200406'); 
alter table dept_partition drop partition (day='20200404'), partition(day='20200405'); 
```

6.查看分区表有多少个分区：

```
show partitions dept_partition;  
```



## Hive 常用交互命令

1.“-e" 不进入hive的交互窗口就能执行 SQL 语句

```
$ bin/hive -e "select id from student;" 
```

2.“-f”执行脚本中 sql 语句 

```
（1）在/opt/module/hive/下创建 datas 目录并在 datas 目录下创建 hivef.sql 文件 
[atguigu@hadoop102 datas]$ touch hivef.sql  

（2）文件中写入正确的 sql 语句
 select *from student;  

（3）执行文件中的 sql 语句
[atguigu@hadoop102 hive]$ bin/hive -f /opt/module/hive/datas/hivef.sql  

（4）执行文件中的 sql 语句并将结果写入文件中
 [atguigu@hadoop102 hive]$ bin/hive -f /opt/module/hive/datas/hivef.sql  > /opt/module/datas/hive_result.txt 
```



## UDF 函数

自定义UDF需要继承UDF类： org.apache.hadoop.hive.ql.UDF，并且重写 evaluate 方法。

```
import org.apache.hadoop.hive.ql.exec.UDF;

public class MyConcatString extends UDF{
	public String evaluate(String a,String b){ 
		return a + "*************"+b; 
	}
}
```

```
import org.apache.hadoop.hive.ql.exec.UDF;

public class CheckSalaryGrade extends UDF{
    public String evaluate(String salary){ 
    	int sal = Integer.parseInt(salary);
    	if(sal<1000) return "Grade A"; 
    	else if(sal>=1000 && sal<3000) return "Grade B"; 
    	else return "Grade C";
    }
}
```



## 工作中遇到的问题记录



### ETL_TIME 时差差8小时:

```
date_format(from_utc_timestamp(current_timestamp(), 'PRC'), 'yyyy-MM-dd HH:mm:ss')

select date_format(from_utc_timestamp(current_timestamp(), 'PRC'), 'yyyy-MM-dd HH:mm:ss') as etl_time
```



### HIVE 里创建临时表产出大量的小文件：

里创建临时表，默认是事务表，事务表的小文件会很大。所以需要将事务表删除重建改成非事务表

下面加了这两行就是事务表：

'transactional'='true', 'transactional_properties'='default',

```
CREATE TABLE `dw.tmp_12_gxt`(
    `sp_id` string,
    `avg_xscb` double,
    `ys_btcb` double)
PARTITIONED BY (
  `data_date` string)
ROW FORMAT SERDE
  'org.apache.hadoop.hive.ql.io.orc.OrcSerde'
STORED AS INPUTFORMAT
  'org.apache.hadoop.hive.ql.io.orc.OrcInputFormat'
OUTPUTFORMAT
  'org.apache.hadoop.hive.ql.io.orc.OrcOutputFormat'
LOCATION
  'hdfs://5star-hdfs/warehouse/tablespace/managed/hive/dw.db/tmp_12_gxt'
TBLPROPERTIES (
  'bucketing_version'='2',
  'transactional'='true',
  'transactional_properties'='default',
  'transient_lastDdlTime'='1617936342')
```

去掉这两行就是非事务表：

```
CREATE TABLE `dw.tmp_12_gxt`(
    `sp_id` string,
    `avg_xscb` double,
    `ys_btcb` double)
PARTITIONED BY (
  `data_date` string)
ROW FORMAT SERDE
  'org.apache.hadoop.hive.ql.io.orc.OrcSerde'
STORED AS INPUTFORMAT
  'org.apache.hadoop.hive.ql.io.orc.OrcInputFormat'
OUTPUTFORMAT
  'org.apache.hadoop.hive.ql.io.orc.OrcOutputFormat'
LOCATION
  'hdfs://5star-hdfs/warehouse/tablespace/managed/hive/dw.db/tmp_12_gxt'
TBLPROPERTIES (
  'bucketing_version'='2',
  'transient_lastDdlTime'='1617936342')
```

所以我们创建临时表的时候可以指定 tblproperties ('transactional' = 'false')：

```
create table dwd.t_coupon_use tblproperties ('transactional' = 'false')
  as
    select * from dw.tmp_12_gxt
```



### 解析json：get_json_object(string json_string,string path)

```
data =
{
 "store":
        {
         "fruit":[{"weight":8,"type":"apple"}, {"weight":9,"type":"pear"}],  
         "bicycle":{"price":19.95,"color":"red"}
         }, 
 "email":"amy@only_for_json_udf_test.net", 
 "owner":"amy" 
}
```

- get单层值

  ```
  hive> select  get_json_object(data, '$.owner') from test;
  结果：amy
  ```

- get多层值

  ```
  hive> select  get_json_object(data, '$.store.bicycle.price') from test;
  结果：19.95
  ```

- get数组值

  ```
  hive> select  get_json_object(data, '$.store.fruit[0]') from test;
  结果：{"weight":8,"type":"apple"}
  ```

  