import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Button, Checkbox, Header, TextField } from '@/components'

// TODO: 홈 화면 디자인 작업 시 교체. 지금은 공용 컴포넌트 확인용 쇼케이스.
export default function HomeScreen() {
  const [nickname, setNickname] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [agreeAll, setAgreeAll] = useState(true)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const emailValid = /^\S+@\S+\.\S+$/.test(email)

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-white">
      <Header title="공용 컴포넌트" onBack={() => {}} />
      <ScrollView contentContainerClassName="gap-8 px-5 pb-10 pt-4">
        <Section title="TextField">
          <TextField label="이메일/닉네임" placeholder="Pawket" />
          <TextField
            label="닉네임"
            placeholder="닉네임을 입력하세요"
            value={nickname}
            onChangeText={setNickname}
            errorMessage={nickname === '관리자' ? '사용할 수 없는 닉네임입니다' : undefined}
          />
          <TextField label="닉네임" value="내용 입력 완료" readOnly />
          <TextField
            label="비밀번호"
            secure
            value={password}
            onChangeText={setPassword}
            helperText="한글/영문 2~10자, 특수문자 사용 불가"
            errorMessage={password.length > 10 ? '한글/영문 2~10자, 특수문자 사용 불가' : undefined}
          />
          <TextField
            label="이메일"
            placeholder="Pawket@gmail.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            action={{ label: '인증요청', disabled: !emailValid, onPress: () => {} }}
          />
          <TextField
            label="이메일"
            value="Pawket@gmail"
            errorMessage="이메일을 다시 확인해주세요"
            action={{ label: '인증요청', disabled: true, onPress: () => {} }}
          />
        </Section>

        <Section title="Checkbox">
          <Checkbox checked={agreeAll} onChange={setAgreeAll} label="전체 동의합니다." />
          <Checkbox
            checked={agreeTerms}
            onChange={setAgreeTerms}
            label={
              <Text className="font-ko text-ko-16 text-ink">
                <Text className="text-main">[필수]</Text> 서비스 이용약관
              </Text>
            }
          />
        </Section>

        <Section title="Button">
          <Button onPress={() => {}}>시작하기</Button>
          <Button disabled>시작하기</Button>
        </Section>
      </ScrollView>
    </SafeAreaView>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-5">
      <Text className="font-en-medium text-en-16 text-ink-soft">{title}</Text>
      {children}
    </View>
  )
}
