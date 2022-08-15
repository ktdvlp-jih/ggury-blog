---
templateKey: blog-post
draft: false
title: springboot 머스테치로 화면 구성하기
date: 2022-08-14T23:30:06.599Z
category: SpringBoot
description: SpringBoot 머스테치로 화면 구성하기
tags: 
- SpringBoot
---
# **머스테치로 화면 구성하기**

머스테치란 서버 템플릿 엔진으로 스프링에서 적극적으로 지원하는 템플릿 엔진입니다.(가장 심플한 템플릿 엔진 대부분 언어 지원)
자바에서는 서버 템플릿, 자바스크립트는 클라이언트 템플릿
템플릿 엔진이란 웹 개발에 있어서 지정된 템플릿 양식돠 데이터가 합쳐져 HTML문서를 출력하는 소프트웨어를 의미합니다.

* ### **머스테치 플러그인 설치**
  1. 인텔리제이 플러그인에서 Mustache 설치 
  2. build.gradle 의존성 추가 후 반영하기(implementation('org.springframework.boot:spring-boot-starter-mustache'))


* ### **기본 페이지 작성**
  1. 머스터치 파일은 resources/templates에서 생성 가능합니다.
  2. 기본적인 html로 index파일을 구성 해당 머스테치는 URL로 매핑합니다.
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