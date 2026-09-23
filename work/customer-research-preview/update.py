# -*- coding: utf-8 -*-
from pathlib import Path
import json, shutil
r=Path('/Users/will/code/网站克隆工作台')
m=Path('/Users/will/Desktop/业务主线/A-部门项目/AI学习站/sources/practice')
w=r/'work/customer-research-preview'
paths=[m/'cases.json',m/'curriculum.json',r/'src/app/practice/cases/[caseId]/page.tsx',r/'src/app/practice/page.tsx',r/'src/lib/ai-learning/practice-cases.json',r/'src/lib/ai-learning/practice-curriculum.json',r/'public/practice-materials/customer-research.txt',r/'public/practice-materials/l01.txt']
for n,p in enumerate(paths): shutil.copy2(p,w/f'before-{n}')
d=json.loads(paths[0].read_text());c=d['cases'][0]
c.update(title='为一个潜在买家做好开发准备',scene='拿到买家的公司名和官网，了解它做什么，判断与我方产品是否匹配、是否值得继续跟进、从哪里开启沟通。',outcome='一份有来源、有匹配理由、有下一步动作的客户开发简报。',brief='帮助外贸企业的业务员开发新客户。先使用现成的「客户背调」Agent 调查一个潜在买家，再补充我方产品与供货能力，形成有针对性的开发思路。第一课体验完整流程，后续基础课沿用同一个案例。',points=['查清客户的真实业务','结合我方能力判断匹配','找到具体的开发切入点','核实依据并决定下一步'])
c['materials']='买家线索：公司名称、官网、所在国家。选择公开资料足够的真实企业，先核实公司与域名对应。\n我方业务资料卡：主营产品、目标市场、定制能力、供货限制，以及希望开发哪类买家。使用获准的脱敏资料；模拟资料须明确标注。\n工具准备：Accio Work 中可用的「客户背调」Agent。先检查可用性和联网能力，本页不代为安装、运行或发送。\n样板状态：固定示范买家、实跑结果和人工修订记录尚待补齐。当前先审阅流程，也可自备合适材料探索。'
c['starterPrompt']='我正在为外贸业务开发潜在买家。请调研以下公司，先帮我了解它做什么、面向哪些市场和客户。\n公司名称：[填写]\n官网：[填写]\n国家/地区：[填写]\n请核对是否为同一家企业，标出关键来源及无法确认的信息。先不要假设它有明确采购意向；找到的资料与基于资料的判断请分开呈现。'
c['steps']=[
dict(title='先查清客户做什么',action='使用客户背调 Agent，输入公司名、官网、国家和调研目的。查看实际检索记录，保存客户业务概况与来源；工具不可用时记录问题，不把模型回答当作联网调查。',evidence='第一份客户概况与关键来源。',concept='模型与工具：模型负责分析，检索工具帮助获取外部资料。',lesson='l01'),
dict(title='补充我方资料，判断哪里匹配',action='补充我方业务资料卡，追问：结合我们的产品、市场和供货限制，哪些业务可能匹配，哪些不适合？对比补充前后的建议。',evidence='一至两个匹配理由，以及不匹配或待确认条件。',concept='上下文：AI 需要了解我们是谁，才能给出有针对性的判断。',lesson='l03'),
dict(title='选一个开发切入点',action='选择一个有依据的机会，明确优先接触的岗位、首次沟通主题和要确认的问题。可以准备沟通草稿，不要求搜齐联系人，不自动发送。',evidence='一个具体切入点和下一步行动。',concept='任务表达：把宽泛的背调请求变成支持业务决定的任务。',lesson='l02'),
dict(title='打开来源，核实后做决定',action='打开关键来源，检查是否认对公司、产品匹配依据是否成立。修正未经证实的结论，决定继续了解、暂缓还是不开发；不要为了交作业强行推荐客户。',evidence='最终简报与一条人工核验记录。',concept='结果核验：区分公开事实、AI 推断和需要问客户的问题。',lesson='l04')]
c['checks']=['公司、官网与国家能对应，未混入同名企业资料。','匹配理由与我方产品和供货条件有关，不是通用套话。','重要结论可追溯到来源，潜在需求保留为推断或待确认问题。','业务员知道下一步联系什么岗位、讨论什么、还要确认什么。','记录实际核验和补充资料后的变化；未运行时不填写虚构结果。']
c['tests']=[]
c['reference']='【成果结构参考，非实跑结果】\n客户是谁：主营产品、渠道、市场与关键来源。\n与我方哪里匹配：一至两个匹配理由，附依据；列出不匹配或待确认条件。\n是否继续跟进：继续了解 / 暂缓 / 不适合，并说明原因。\n如何开启沟通：优先联系的岗位、一个业务切入点、希望向对方确认的问题。找不到联系人时不编造姓名和邮箱。\n人工核验：检查了什么来源、修订了什么；没有发现错误也如实记录。\n前后变化：补充我方资料后，哪项建议更具体？若没有变化，检查材料是否足以影响判断。\n\n不同买家的结论应当不同。有依据地判断不适合开发，同样是合格成果。'
c['extensions']=['第一课：体验一份完整的客户开发简报，不要求自己制作 Skill、连接店铺或扫描全店。','后续基础课：沿用同一案例，逐步改进任务表达、材料组织与核验方法；按需补课，不新增四份作业。','进阶：再研究将验证过的方法封装成 Skill，或结合获准使用的买家行为和聊天记录。']
c['sources']=[dict(label='吕洪伟「客户背调」· v1.0.1 · 第三方 Agent，已读 README，尚未实跑',url='https://agenthub.accio-ai.com/space/global/客户背调')]
d['version']='2026-09-20.7';raw=json.dumps(d,ensure_ascii=False,indent=2)+'\n'
paths[0].write_text(raw);paths[4].write_text(raw)
u=json.loads(paths[1].read_text());l=next(x for x in u['lessons'] if x['id']=='l01')
l.update(goal='体验真实买家公开信息调研，结合我方能力判断开发切入点，分清模型、工具与人工判断',materials='买家公司名、官网、国家与我方业务资料卡；固定示范买家及实跑参照待补齐',deliverable=c['outcome'],checks='核对身份；匹配有依据；行动具体；人工核实来源',reference='客户开发简报结构参考，非实跑结果',quality='业务员能据此决定是否继续了解，以及下一步如何开启沟通。',host='方案预览：使用可用的Accio Work客户背调Agent自行探索，固定样板待实跑。本页不安装Agent、不调用模型、不发送消息。')
l['pilot']=dict(brief=c['brief'],input=c['materials'],steps=[x['action'] for x in c['steps']],example=c['reference'],bad='只说客户很有潜力，却没有身份来源、匹配理由和下一步动作。',variant='补充我方业务资料后，对照建议是否更具体；这是同一流程，不是额外作业。',checklist=c['checks'])
u['version']=d['version'];raw=json.dumps(u,ensure_ascii=False,indent=2)+'\n';paths[1].write_text(raw);paths[5].write_text(raw)
paths[6].write_text(c['title']+'\n方案预览，尚未实跑\n\n'+c['materials']+'\n\n起步指令\n'+c['starterPrompt']+'\n');paths[7].write_text(paths[6].read_text())
p=paths[3];s=p.read_text().replace('教学模拟 · 可试做','方案预览 · 待实跑').replace('一份成果＋测试记录','一份业务成果').replace('第一课先完成客户背调的小任务，后续基础课沿用同一案例加深。材料为教学模拟，尚未经过团队试做与产品实跑验证。','先用现成的客户背调 Agent，为一个潜在买家做好开发准备。后续基础课沿用同一案例。当前为方案预览，固定示范买家和实跑参照待补齐。');p.write_text(s)
