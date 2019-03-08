export const customPlayGroups = [
  {
    // 广东11选5 连码
    code: ['gd11x5_ca-m_wc'],
    component: 'WithCode',
    options: Array.from(Array(11).keys()).map(item => item + 1)
  },
  {
    // 广东11选5 直选
    code: ['gd11x5_ca-m_seq'],
    component: 'gd11x5Seq',
    options: Array.from(Array(11).keys()).map(item => item + 1)
  },
  {
    // 重庆幸运农场 连码, 广东快乐十分 连码
    code: ['cqlf_ca-m_wc', 'gdklsf_ca-m_wc'],
    component: 'WithCode',
    options: Array.from(Array(20).keys()).map(item => item + 1)
  },
  {
    // 六合彩 连码
    code: ['hkl_ca-m_wc', 'luckl_ca-m_wc', 'cshkl_ca-m_wc', 'cs600hkl_ca-m_wc', 'csjndhkl_ca-m_wc'],
    component: 'WithCode',
    options: Array.from(Array(49).keys()).map(item => item + 1)
  },
  {
    // 六合彩 连肖
    code: ['hkl_ca-m_exl', 'luckl_ca-m_exl', 'cshkl_ca-m_exl', 'cs600hkl_ca-m_exl', 'csjndhkl_ca-m_exl'],
    component: 'hk6Exl'
  },
  {
    // 六合彩 连尾
    code: ['hkl_ca-m_exltail', 'luckl_ca-m_exltail', 'cshkl_ca-m_exltail', 'cs600hkl_ca-m_exltail', 'csjndhkl_ca-m_exltail'],
    component: 'hk6Exl'
  },
  {
    // 六合彩 和肖
    code: ['hkl_ca-m_shxia', 'luckl_ca-m_shxia', 'cshkl_ca-m_shxia', 'cs600hkl_ca-m_shxia', 'csjndhkl_ca-m_shxia'],
    component: 'shxiaZdc',
    options: Array.from(Array(12).keys()).map(item => item)
  },
  {
    // 六合彩 自選不中
    code: ['hkl_ca-m_ntinfvr', 'luckl_ca-m_ntinfvr', 'cshkl_ca-m_ntinfvr', 'cs600hkl_ca-m_ntinfvr', 'csjndhkl_ca-m_ntinfvr'],
    component: 'shxiaZdc',
    options: Array.from(Array(49).keys()).map(item => item + 1)
  },
  {
    // 福彩3D 组选三
    code: ['fc3d_ca-m_pic'],
    component: 'fc3dIc',
    options: Array.from(Array(10).keys())
  },
  {
    // 福彩3D 组选六
    code: ['fc3d_ca-m_msic'],
    component: 'fc3dIc',
    options: Array.from(Array(10).keys())
  },
  {
    // 福彩3D 二字定位
    code: ['fc3d_ca-m_2df'],
    component: 'fc3dCa2df',
    options: Array.from(Array(10).keys()).map(item => item)
  },
  {
    // 福彩3D 三字定位
    code: ['fc3d_ca-m_3df'],
    component: 'fc3dCa2df',
    options: Array.from(Array(10).keys()).map(item => item)
  }
]

export const HKL_GAMES = ['hkl', 'luckl', 'cshkl', 'cs600hkl', 'csjndhkl']
