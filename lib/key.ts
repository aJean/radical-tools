/**
 * @file the key
 */

export default {
    code: Buffer.from('radical1timetosaygoodbye').toString('base64'),
    spliter: '~#~',
    secret: 'skt1winsforever',
    len: 128,
    suffixs: ['mobile_r.jpg', 'mobile_l.jpg', 'mobile_u.jpg', 'mobile_d.jpg', 'mobile_f.jpg', 'mobile_b.jpg'],
    order: ['r', 'l', 'u', 'd', 'f', 'b'],
    porder: ['l', 'f', 'r', 'b', 'u', 'd']
};