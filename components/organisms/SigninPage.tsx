import { useState, VFC } from 'react'
import client from '../../api/client'
import { useDispatch } from 'react-redux'
import { userSlice } from '../../store/user'
import { authSlice } from '../../store/auth'
import Router from 'next/router'
import Cookies from 'js-cookie'
import { yupResolver } from '@hookform/resolvers/yup'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'

import { useSelector } from 'react-redux'
import { RootState } from '../../store'

import { LoadingCircular } from '../atoms/LoadinCircular'

import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'


const theme = createTheme();

const useStyles = makeStyles({
  LoadingCircularWrap: {
    width: '30vw',
    height: '50vh',
    margin: '40vh auto 0 auto',
    textAlign: 'center',
  },
})

interface PROPS {
  setFormToggle: (value: boolean) => void;
}

interface FormInputType {
  email: string
  password: string
}

const schema = yup.object({
  email: yup
    .string()
    .required('必須項目です')
    .email('正しいメールアドレス入力してください')
    .min(5,"5文字以上で入力してください")
    .max(100,"100文字以下で入力してください"),
  password: yup
    .string()
    .required('必須項目です')
    .min(6,"6文字以上で入力してください")
    .max(30,"30文字以下で入力してください")
})

export const SigninPage: VFC<PROPS> = ({setFormToggle}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const auth = useSelector((state: RootState) => state.auth)
  const {loading} = auth.auth

  const classes = useStyles();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputType>({
    resolver: yupResolver(schema),
  })

  const dispatch = useDispatch();

  const onSubmit: SubmitHandler<FormInputType> = async (e:any) => {
    dispatch(
      authSlice.actions.authSetLoading(true)
    )
    client
    .post('signin',
    { Email: email, Password: password},
    { headers: {'Content-Type': 'application/json'}, responseType: 'json' }
    )
    .then(response => {
      dispatch(
        userSlice.actions.userSign(response.data.user)
      )
      dispatch(
        authSlice.actions.authSign(
          {
            jwt: response.data.jwt,
            isSignedIn: true,
            loading: false,
          }
      )
      )
      Cookies.set('_access_token', response.data.jwt)
      dispatch(
        authSlice.actions.authSetLoading(false)
      )
      Router.push('/user')
    });
  }

  return (
    <>
    {
      loading ?
      <div className={classes.LoadingCircularWrap}><LoadingCircular /></div>:
      (
        <ThemeProvider theme={theme}>
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
              sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                サインイン
              </Typography>
              <Box component="form" noValidate sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="メールアドレス"
                      {...register('email')}
                      error={"email" in errors}
                      helperText={errors.email?.message}
                      name="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      {...register('password')}
                      error={"password" in errors}
                      helperText={errors.password?.message}
                      name="password"
                      label="パスワード"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={handleSubmit(onSubmit)}
                >
                  サインイン
                </Button>
                <Grid container justifyContent="flex-end">
                  <Grid item>
                    <Button onClick={() => setFormToggle(false)}>
                      アカウントをお持ちでない方はこちら
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Container>
        </ThemeProvider>
          )
        }
      </>
  );
}
