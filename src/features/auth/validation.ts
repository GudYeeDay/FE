/**
 * 인증 화면 입력 규칙. 문구는 Figma placeholder/에러 문구 기준.
 * 서버 규칙이 정해지면 여기만 맞추면 된다.
 */
export const rules = {
  email: {
    test: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
    placeholder: 'Pawket@gmail.com',
    error: '이메일을 다시 확인해주세요',
  },
  code: {
    test: (v: string) => /^\d{4}$/.test(v),
    placeholder: '4자리 숫자 입력',
    error: '인증번호를 다시 확인해주세요',
  },
  password: {
    // 영문 소문자 8~16자, 특수문자 1개 이상 포함 (숫자 허용, 대문자·공백 불가)
    test: (v: string) =>
      /^(?=.*[a-z])(?=.*[^a-z0-9])[\x21-\x7e]{8,16}$/.test(v) && !/[A-Z]/.test(v),
    placeholder: '영문 소문자 8~16자, 특수문자 포함',
    error: '영문 소문자 8~16자, 특수문자를 포함해주세요',
  },
  passwordConfirm: {
    placeholder: '비밀번호 재입력',
    error: '비밀번호가 일치하지 않습니다',
  },
  nickname: {
    test: (v: string) => /^[가-힣a-zA-Z]{2,10}$/.test(v),
    placeholder: '한글/영문 2~10자, 특수문자 사용 불가',
    error: '한글/영문 2~10자, 특수문자 사용 불가',
  },
} as const

/** 비어 있으면 에러를 보이지 않고, 입력했는데 규칙에 안 맞을 때만 문구를 돌려준다 */
export function fieldError(value: string, valid: boolean, message: string) {
  return value.length > 0 && !valid ? message : undefined
}
