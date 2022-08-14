---
templateKey: blog-post
draft: false
title: springboot 게시글 등록 화면 만들기
date: 2022-08-15T02:57:06.599Z
category: SpringBoot
description: SpringBoot 게시글 등록 화면 만들기
tags: 
- SpringBoot0
---
# **게시글 등록 화면 만들기**
앞에서는 PostsApiController로 API를 구성했으나 여기선 바로 화면으로 개발하겠습니다.
HTML이 아닌 부트스트랩을 통해 화면을 구성해 보도록 하겠습니다. 프론트엔드 라이브러리를 사용할 수 있는 방법은 외부 CDN 혹은 직접 라이브러리를 받아서 사용 하는 방식이 있는데
외부가 아니 안정적으로 이용하기 위해 내부로 내려받아 사용해 보도록 하겠습니다.
https://mafa.tistory.com/entry/5-Spring-Boot%EC%97%90-BootStrap-%EC%A0%81%EC%9A%A9%ED%95%98%EA%B8%B0?category=1020270 해당 부분이 정리가 잘되어있어서 이부분을 참고해 주시면 되겠습니다.


### **header,footer레이아웃 작성**
templates디렉토리에 header,footer.mustache파일을 생성합니다.
기본적으로 css는 화면을 먼저 그리기 때문에 head부분에 넣고 body부분은 head부분이 실행이 완료된후에 실행되기에 js를 적용했습니다.
css와 js는 파일 위치마다 경로가 달라질수 있으니 주의 해주세요

### **index.mustache**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="../static/css/sb-admin-2.min.css">

  <title>스프링 부트 웹 서비스</title>
</head>
<body>

<script src="../static/js/jquery-3.6.0.min.js"></script>
<script src="../static/js/sb-admin-2.min.js"></script>

</body>
</html>
```


### **index.mustache**
```html
<html>
<head>
<title>스프링부트 웹서비스</title>
<meta http-equiv="Content-Type" content="text/html;" charset="UTF-8">
</head>

<body>
<h1>스프링 부트로 시작하는 웹 서비스</h1>
</body>
</html>
```
  3. web패키지안에 IndexController생성 머스터치 스타터 때분에 문자열을 반환할경우 앞의 경로와 뒤의 파일확장자는 자동 지정 즉 index.mustache로 반환되어 ViewResolver가 처리합니다. ViewResolver(URL 요청 결과를 전달합 타입과 값을 지정하는 관리자)
```java
@Controller
public class IndexController {

  @GetMapping
  public String index(){
    return "index";
  }
}
```


## **\-IndexControllerTest-**
```java
@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = RANDOM_PORT)
public class IndexControllerTest {
  @Autowired
  private TestRestTemplate restTemplate;

  @Test
  public void mainpage_Load(){
    // when
    String body = this.restTemplate.getForObject("/",String.class);

    // then
    assertThat(body).contains("스프링 부트로 시작하는 웹 서비스");

  }
}
```

## **\-테스트 코드 결과-**
이 테스트는 실제로 URL 호출시 페이지의 내용이 제대로 호출되는지에 대한 테스트입니다
TestRestTemplate를 통해 "/"로 호출했을때 index.mustache에 body에 있는 문자열이 포함된 코드가 있는지 확인하면됩니다.