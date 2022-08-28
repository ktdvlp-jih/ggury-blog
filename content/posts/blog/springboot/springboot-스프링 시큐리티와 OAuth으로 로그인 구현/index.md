---
templateKey: blog-post
draft: false
title: springboot springboot-스프링 시큐리티와 OAuth으로 로그인 구현
date: 2022-08-20T20:00:06.599Z
category: SpringBoot
description: SpringBoot springboot-스프링 시큐리티와 OAuth으로 로그인 구현
tags: 
- SpringBoot
---
# **스프링 시큐리티와 OAuth2.0**
스프링 시큐리티란 사용자 "인증" 및 "권한 부여"를 위한 프레임워크입니다. 이를 통해, 특정 URL에 접근을 허가 또는 불허 할 수 있습니다.
요새 많은 서비스에서 로그인 기능을 구글,네이버,카카오톡과 같은 소셜 로그인 기능을 제공합니다.
직접 구현시 모든것을 구현시켜야하다보니 시간과 노력이 커집니다. OAuth 로그인 구현 하게 된다면
* 로그인 시 보안
* 회원가입 시 이메일 혹은 전화번호 인증
* 비밀번호 찾기
* 비밀번호 변경
* 회원정보 변경
이러한 기능을을 모두 맡기고 서비스 개발에 집중 할 수 있습니다. 

먼저 구글 서비스 등록을 하는데 이부분은 구글 클라우드 플랫폼(https://console.cloud.google.com/)에 접속해서 프로젝트 탭을 클릭후
1. 새 프로젝트 생성을 합니다.
![구글서비스등록1](/assets/구글서비스등록1.png "구글서비스등록1")
![구글서비스등록2](/assets/구글서비스등록2.png "구글서비스등록2")

2. API 및 서비스 설정:OAuth 동의 화면
![구글서비스등록3](/assets/구글서비스등록3.png "구글서비스등록3")
![구글서비스등록4](/assets/구글서비스등록4.png "구글서비스등록4")


3. API 및 서비스 설정: OAuth2.0 클라이언트 ID 만들기화면
![구글서비스등록5](/assets/구글서비스등록5.png "구글서비스등록5")
![구글서비스등록6](/assets/구글서비스등록6.png "구글서비스등록6")
![구글서비스등록7](/assets/구글서비스등록7.png "구글서비스등록7")

application-oauth.properties 파일 생성후 클라이언트 아이디와 보안 비밀번호 코드를 등록합니다.
![구글서비스등록8](/assets/구글서비스등록8.png "구글서비스등록8")
여기서 scope-profile,email경우 등록해도 안해도 되지만 등록하는 이유는 openid라는 scope가 있으면 Open Od Provide로 인식하기 때문
이렇게 되면 OpenID Provider인 서비스와 그렇지 않은 서비스(카카오/네이버)등으로 나눠서 OAuth2Service를 만들어야하기 합니다.
그래서 하나의 OAuth2Sevice로 사용하기 위해 일부러 openid scope를 빼고 등록합니다.

스프링 부트에서는 properties의 이름을 application-xxx.properties로 만들면 xxx라는 이름의 profile이 생성되어 이를 관리 할 수 있습니다.
즉,profile=xxx라는 식으로 호출하면 해당 properties의 설정들을 가져올 수 있습니다. application.properties에 spring-profiles.include=oauth 이 코드를 추가 합니다.
그럼 이제 이 설정값을 사용할 수 있습니다.
여기서 중요한점 클라이언트 아이디와 보안 비밀번호는 보안이 중요한 정보입니다. 이들이 외부에 노출되면 개인정보를 가져갈 수 있는 취약점이 될 수 있기에
혹시나 깃과 연동해서 사용중이시라면 .gitignore에 application-oauth.properties 코드를 추가 합니다.
![구글서비스등록9](/assets/구글서비스등록9.png "구글서비스등록9")
만약 .gitignore에 추가 하였음에더 커밋목록에 노출된다면 git 캐쉬문제이니 해당 폴더에 gitbash를 사용해
git rm -r --cached .
git add .
git commit -m "fixed untracked files"
명령어를 입력해 보시길 바랍니다.

# **구글 로그인 연동하기**
인증정보를 받았으니 프로젝트 구현을 해보겠습니다.
먼저 사용자 정보를 담당할 도메인 User클래스 생성

# *User*
```java
package com.ggurys.springbootwebservice.domain.user;

@Getter
@NoArgsConstructor
@Entity
public class User extends BaseTimeEntity{
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String email;

  @Column
  private String picture;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Role role;

  @Builder
  public User(String name, String email, String picture, Role role) {
    this.name = name;
    this.email = email;
    this.picture = picture;
    this.role = role;
  }

  public User update(String name, String picture) {
    this.name = name;
    this.picture = picture;
    return this;
  }

  public String getRoleKey() {
    return this.role.getKey();
  }
}
```
* Enumerated(EnumType.STRING)
JPA로 DB 저장할때 Enum값을 어떤 형태로 저장할지 결정,default값은 int이지만 DB 확인시 의미를 알수없어 문자열로 저장되도록 선언

# **사용자 권한을 관리할 Enum클래스 Role**



## **\-PostsListResponseDto-**
* DB에서 꺼낸 데이터를 저장하는 Entity (DTO)
```java
@Getter
public class PostsListResponseDto {
    private Long id;
    private String title;
    private String author;
    private LocalDateTime modifiedDate;

    public PostsListResponseDto(Posts entity) {
        this.id = entity.getId();
        this.title = entity.getTitle();
        this.author = entity.getAuthor();
        this.modifiedDate = entity.getModifiedDate();
    }
}
```
