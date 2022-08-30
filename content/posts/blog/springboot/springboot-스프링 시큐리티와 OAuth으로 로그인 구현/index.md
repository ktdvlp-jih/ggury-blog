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

먼저 구글 서비스 등록을 하는데 이부분은 구글 클라우드 플랫폼(https://console.cloud.google.com/)에 접속해서 순서대로 진행합니다
1. 프로젝트 탭 선택후 새 프로젝트 생성을 합니다.
![구글서비스등록1](/assets/구글서비스등록1.png "구글서비스등록1")
![구글서비스등록2](/assets/구글서비스등록2.png "구글서비스등록2")
<br/>
2. API 및 서비스 설정:OAuth 동의 화면
![구글서비스등록3](/assets/구글서비스등록3.png "구글서비스등록3")
![구글서비스등록4](/assets/구글서비스등록4.png "구글서비스등록4")
<br/>
3. API 및 서비스 설정: OAuth2.0 클라이언트 ID 만들기화면
![구글서비스등록5](/assets/구글서비스등록5.png "구글서비스등록5")
![구글서비스등록6](/assets/구글서비스등록6.png "구글서비스등록6")
![구글서비스등록7](/assets/구글서비스등록7.png "구글서비스등록7")
<br/>
이후 application-oauth.properties 파일 생성후 클라이언트 아이디와 보안 비밀번호 코드를 등록합니다.
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
<br/>
만약 .gitignore에 추가 하였음에더 커밋목록에 노출된다면 git 캐쉬문제이니 해당 폴더에 gitbash를 사용해
* git rm -r --cached .
* git add .
* git commit -m "fixed untracked files"
명령어를 입력해 보시길 바랍니다.

# **구글 로그인 연동하기**
인증정보를 받았으니 프로젝트 구현을 해보겠습니다.

## **\-User-**
사용자 정보를 담당할 도메인 User클래스 사용자의 name,picture이 변경되면 User 엔티티에도 반영
```java
package com.ggurys.springbootwebservice.domain.user;

import com.ggurys.springbootwebservice.domain.BaseTimeEntity;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import javax.persistence.*;
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

* ### **Enumerated(EnumType.STRING)**
  1. JPA로 DB 저장할때 Enum값을 어떤 형태로 저장할지 결정합니다.
  2. default값은 int로된 숫자로 저장
  3. 숫자로 저장시 DB로 확인시 그 값이 무슨 코드를 의미하는지 알수 없습니다.
  4. 그래서 무자열(EnumType.String)로 저장 되도록 선언합니다.


## **\-Role-**
1. 사용자 권한을 관리할 Enum클래스 Role 생성
2. 스프링 시큐리티에서는 권한 코드에 항상 ROLE_이 앞에 있어야함만 그래서 코드별 키값을 "ROLE_****" 등으로 지정 
```java
package com.ggurys.springbootwebservice.domain.user;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {
    GUEST("ROLE_GUEST", "손님"),
    USER("ROLE_USER", "일반 사용자");

    private final String key;
    private final String title;
}
```

## **\-UserRepository-**
User의 CRUD를 책입질 UserRepository 생성

```java
package com.ggurys.springbootwebservice.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
}
```
* ### **findByEmail**
  1. 소셜 로그인으로 바환되는 값 중 email을 통해 이미 생성된 사용자인지 처음 가입하는 사용자인지 판단하는 메소드

## **\-스프링 시큐리티 설정-**
build.gradle에 compile('org.springframework.boot:spring-boot-starter-oauth2-client') 의존성 추가

* ### **spring-boot-starter-oauth2-client**
1. 소셜 로그인 등 클라이언트 입장에서 쇼셜 기능 구현시 필요한 의존성
2. spring-securiry-oauth2-client와 spring-securiryoauth2-jose를 기본으로 관리해줍니다

## **\-SecuriryConfig-**
OAuth라이어브리를 이용한 쇼셜 로그인 섧정 코드 작성을 하는곳 이며 시큐리티 관련 클래스를 담는곳

```java
package com.ggurys.springbootwebservice.config.auth;

import com.ggurys.springbootwebservice.domain.user.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

@RequiredArgsConstructor
@EnableWebSecurity // 1.
public class SecurityConfig extends WebSecurityConfigurerAdapter {

  private final CustomOAuth2UserService customOAuth2UserService;

  @Override
  protected void configure(HttpSecurity http) throws Exception {
    http
            .csrf().disable().headers().frameOptions().disable() // 2.
            .and()
            .authorizeRequests() // 3.
            .antMatchers("/", "/view/**", "/css/**", "/images/**", "/js/**", "/h2-console/**", "/profile").permitAll().antMatchers("/api/v1/**").hasRole(Role.USER.name()) // 4.
            .anyRequest().authenticated() // 5.
            .and()
            .logout()
            .logoutSuccessUrl("/") // 6.
            .and()
            .oauth2Login() // 7.
            .userInfoEndpoint() // 8.
            .userService(customOAuth2UserService); // 9.
  }
}
```

* ### **EnableWebSecurity**
1. Spring Securiry 설정을 활성화

* ### **.csrf().disable().headers().frameOptions().disable()**
1. h2-console 화면을 사용하기 위해 해당옵션을 비활성화

* ### **authorizeRequests**
1. URL별 권한 관리를 설정하는 옵션의 시작점
2. authorizeRequests가 선언 되어야만 antMatchers옵션을 사용 할 수 있습니다.

* ### **antMatchers**
1. 권한 관리 대상을 지정하는 옵션
2. URL,HTTP 메소드별로 관리 가능
3. "/"등 지정된 URL들은 permitAll() 옵션을 통해 전체 열람 권한을 부여
4. "/api/v1/**" 주소를 가진 API는 USER 권한을 가진 사람만 가능하도록 허용

* ### **anyRequest**
1. 설정된 값들 이외 나머지 URL을 나타냅니다.
2. 여기서 authenticated()를 추가하여 나머지 URL들은 모두 인증된 사용자들에게만 허용하게 됨
3. 즉 로그인한 사용자들을 의미

* ### **.logoutSuccessUrl("/")**
1. 로그아웃 기능에 대한 여러 설정의 진입점
2. 로그아웃 성공 시 "/" 주소로 이동

* ### **oauth2Login**
1. OAuth2 로그인 기능에 대한 여러 설정의 진입점

* ### **userInfoEndpoint**
1. OAuth2 로그인 성공 이후 사용자 정보를 가져올 때의 설정들을 담당

* ### **userService**
1. 소셜 로그인 성공 시 후속 조치를 진행할 UserService 인터페이스의 구현체를 등록합니다.
2. 리소스 서버(쇼셜서비스)에서 사용자 정보를 가져온 상태에서 추가로 진행 하고자하는 기능을 명시할수 있습니다.


## **\-CustomOAuth2UserService-**
구글 로그인 이후 가져온 사용자의 정보(email.name,picture )들을 기반으로 가입 및 정보수정, 세션저장등의 기능을 지원

```java
package com.ggurys.springbootwebservice.config.auth;

import com.ggurys.springbootwebservice.config.auth.dto.OAuthAttributes;
import com.ggurys.springbootwebservice.config.auth.dto.SessionUser;
import com.ggurys.springbootwebservice.domain.user.User;
import com.ggurys.springbootwebservice.domain.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;
import java.util.Collections;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {
  private final UserRepository userRepository;
  private final HttpSession httpSession;

  @Override
  public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
    OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
    OAuth2User oAuth2User = delegate.loadUser(userRequest);

    // OAuth2 서비스 id (구글, 카카오, 네이버)
    String registrationId = userRequest.getClientRegistration().getRegistrationId(); // 1.
    // OAuth2 로그인 진행 시 키가 되는 필드 값(PK)
    String userNameAttributeName = userRequest.getClientRegistration().getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName(); // 2.

    // OAuth2UserService
    OAuthAttributes attributes = OAuthAttributes.of(registrationId, userNameAttributeName, oAuth2User.getAttributes()); // 3.
    User user = saveOrUpdate(attributes);
    httpSession.setAttribute("user", new SessionUser(user)); // 4. SessionUser (직렬화된 dto 클래스 사용) 

    return new DefaultOAuth2User(Collections.singleton(new SimpleGrantedAuthority(user.getRoleKey())),
            attributes.getAttributes(),
            attributes.getNameAttributeKey());
  }

  // 유저 생성 및 수정 서비스 로직
  private User saveOrUpdate(OAuthAttributes attributes){
    User user = userRepository.findByEmail(attributes.getEmail())
            .map(entity -> entity.update(attributes.getName(), attributes.getPicture()))
            .orElse(attributes.toEntity());
    return userRepository.save(user);
  }
}
```
* ### **registrationId**
1. 현재 로그인 진행 중인 서비스를 구분하는 코드
2. 지금은 구글만 사용하는 불필요한 값이지만 이후 네이버,카카오 로그인 연동시 어떤 소셜로그인인지 구분하기 위해 사용

* ### **userNameAttributeName**
1. OAuth2 로그인 진행 시 키가 되는 필드값을 의미(Primary Key)
2. 구글의 경우 기본적으로 코드를 지원하지만, 네이버 카카오등은 기본 지원하지 않음(구글의 경우 기본코드 "sub")
3. 이후 네이버,카카오 로그인과 구글 로그인을 동실 지원할 때 사용

* ### **OAuthAttributes**
1. OAuth2UserService를 통해 가져온 OAuth2User의 attribute를 담을 클래스
2. 나중에 네이버,카카오등 다른 소셜 로그인도 해당 클래스 사용
3. 바로 아래에서 이 클래스의 코드가 나오니 차례로 생성하면 됨

* ### **SesstionUser**
1. 세션에 사용자 정보를 저장하기위한 Dto 클래스
2. User 클래스를 사용하지 않는 이유(에러), 오류 뜨는이유 User클래스에 직혈화가 구현되지 않았다는 에러가 뜨는데 그렇다고 직렬화 코드를 넣으면 User클래스가 엔티티 이기에 언제 어디서 다른 엔티티와 관계가 형성될지 모르기 떄문에 1:N, N:M 등 자식 엔티티를 갖고 있다면 직렬화 대상에 자식들 까지 포함되니 성능 이슈,부슈효과가 발생할 확률이 높기때문에 직렬화 기능을 가진 세션 Dto를 추가로 만든후 운영 및 유지보수 때 많은 도움이 됩니다.

## **\-OAuthAttributes-**
Dto 클래스
```java
package com.ggurys.springbootwebservice.config.auth.dto;

import com.ggurys.springbootwebservice.domain.user.Role;
import com.ggurys.springbootwebservice.domain.user.User;
import lombok.Builder;
import lombok.Getter;
import java.util.Map;

@Getter
public class OAuthAttributes {
    private Map<String, Object> attributes; // OAuth2 반환하는 유저 정보 Map
    private String nameAttributeKey;
    private String name;
    private String email;
    private String picture;

    @Builder
    public OAuthAttributes(Map<String, Object> attributes, String nameAttributeKey, String name, String email, String picture) {
        this.attributes = attributes;
        this.nameAttributeKey = nameAttributeKey;
        this.name = name;
        this.email = email;
        this.picture = picture;
    }
    
    // 1 
    public static OAuthAttributes of(String registrationId, String userNameAttributeName, Map<String, Object> attributes){
        // 여기서 네이버와 카카오 등 구분 (ofNaver, ofKakao)

        return ofGoogle(userNameAttributeName, attributes);
    }


    private static OAuthAttributes ofGoogle(String userNameAttributeName, Map<String, Object> attributes) {
        return OAuthAttributes.builder()
                .name((String) attributes.get("name"))
                .email((String) attributes.get("email"))
                .picture((String) attributes.get("picture"))
                .attributes(attributes)
                .nameAttributeKey(userNameAttributeName)
                .build();
    }
    
    // 2.
    public User toEntity(){
        return User.builder()
                .name(name)
                .email(email)
                .picture(picture)
                .role(Role.GUEST) // 기본 권한 GUEST
                .build();
    }

}
```

* ### **of()**
1. OAuth2User에서 반환하는 사용자 정보는 Map이기 때문에 값 하나하나를 변환해야만 합니다

* ### **toEntity**
1. User엔티티를 생성합니다
2. OAuthAttributes에서 엔티티를 생성하는 시점은 처음 가입할 때
3. 가입할 때의 기본권한을 GUEST로 주기 위해서 role 빌더값에서 Role.GUEST를 사용
4. OAuthAttributes 클래스 생성이 끝났으면 같은 패키지에 SesstionUser클래스를 생성

## **\-SesstionUser-**
SesstionUser에는 인증된 사용자 정보만 필요로 함, 그 외에 필요한 정보들은 없으니 name,email,picture만 필드로 선언합니다.
```java

package com.ggurys.springbootwebservice.config.auth.dto;
import com.ggurys.springbootwebservice.domain.user.User;
import lombok.Getter;
import java.io.Serializable;
/**
 * 직렬화 기능을 가진 User클래스
 */
@Getter
public class SessionUser implements Serializable {
    private String name;
    private String email;
    private String picture;

    public SessionUser(User user){
        this.name = user.getName();
        this.email = user.getEmail();
        this.picture = user.getPicture();
    }
}
```

# **로그인 테스트**
스프링 시큐리티가 잘 적용되었는지 확인을 위해 버튼을 추가하고 테스트를 해보겠습니다.
```html
<h1>스프링 부트로 시작하는 웹서비스</h1>
<div class="col-md-12">
    <div class="row">
        <div class="col-md-6">
            <a href="/posts/save" role="button" class="btn btn-primary">글 등록</a>
            {{#userName}} <!-- 1. -->
                Logged in as: <span id="user">{{userName}}</span>
                <a href="/logout" class="btn btn-info active" role="button">Logout</a>  <!-- 2. -->
            {{/userName}}
            {{^userName}} <!-- 3. -->
                <a href="/oauth2/authorization/google" class="btn btn-success active" role="button">Google Login</a>  <!-- 4. -->
            {{/userName}}
        </div>
    </div>
</div>

<br/>
<!--목록 출력 영역-->
```
* ### **{{#userName}}**
1. 머스테치는 if문( userName != null )을 제공하지 않으면 true/false여부만 판단
2. 항상 최종값만 넘겨 주어야하며 해당 코드는 userName이 있다면 userName을 노출 시키도록 구성

* ### **a href = "/logout"**
1. 스프링 시큐리티에서 기본적으로 제공하는 로그아웄URL, 즉 개발자가 별도로 저 URL에 해당하는 컨트롤러 생성 하지않아도 됩니다
2. SecurityConfig 클래스에서 URL을 변경할 순 있지만 기본 URL을 사용해도 충분하니 그대로 사용

* ### **{{^userName}}**
1. 해당 값이 존재 하지 않는경우에는 "^" 를 사용
2. userName이 없다면 로그인 버튼을 노출 시키도록 구성

* ### **a href = "/oauth2/authorization/google"**
1. 스프링 시큐리티에서 기본적으로 제공하는 로그인URL, 즉 개발자가 별도로 저 URL에 해당하는 컨트롤러 생성 하지않아도 됩니다
2. SecurityConfig 클래스에서 URL을 변경할 순 있지만 기본 URL을 사용해도 충분하니 그대로 사용

## **\-IndexController-**
index.mustache에서 userName을 사용할 수 있게 IndexController에서 userName을 model에 저장하는 코드 추가 작성
```java

@RequiredArgsConstructor
@Controller
public class IndexController {

  private final PostsService postsService;
  private final HttpSession httpSession;

  @GetMapping("/")
  public String index(Model model){ // model 서버 템플릿 엔진에서 사용할 수 있는 객체를 저장 (postsService.findAllDesc()로 가져온 결과를 posts로 index.mustache에 전달)
    model.addAttribute("posts", postsService.findAllDesc());

    SessionUser user = (SessionUser) httpSession.getAttribute("user");

    if(user != null){
      model.addAttribute("userName", user.getName());
    }
    return "index";
  }
}
```

* ### **(SessionUser) httpSession.getAttribute("user")**
1. CustomOAuth2UserService에서 로그인 성공시 세션에 SessionUser를 저장하도록 구성 해두었습니다. 즉 로그인 성공시 httpSession.getAttrivute("user")에서 값을 가져올 수 있습니다.

* ### **if (user != null)**
1. 세션에 저장된 값이 있을 때만 model에 userName으로 등록
2. 세션에 저장된 값이 없으면 model엔 아무런 값이 없는 상태이니 로그인 버튼이 보이게 설정

## **\-테스트 결과-**
1. 글 등록이나, 로그인 버튼 클릭시 구글 로그인 동의 화면으로 이동
















