---
templateKey: blog-post
draft: false
title: SpringBoot 게시판 등록/수정/조회 API 만들기
date: 2022-08-08T13:41:06.599Z
category: Springboot
description: SpringBoot 게시판 등록/수정/조회 API 만들기
tags:
thumbnail: /assets/spring-웹-계층.png
- SpringBoot
---
# **게시판 등록/수정/조회 API 만들기**

API를 만들기 위해 총 3개의 클래스가 필요합니다.

1. Request(요청) 데이터를 받을 DTO (Data Transfer Object)
2. API요청을 받을 Controller
3. 트랜잭션, 도메인 기능 간의 순서를 보장하는 Service

그전 Spring의 웹 계층을 살펴 보겠습니다.

![Spring WebLayer](/assets/spring-웹-계층.png "Spring WebLayer")

* ### **Web Layer**

  1. 컨트롤러(@Controller)와 JSP/Freemarker 등의 뷰 템플릿 영역
  2. 외부 요청과 응답에 대한 전반적인 영역
* ### **Service Layer**

  1. @Service에 사용되는 영역이며 Controller와 DAO (DAO(Data Access Object)) 의 중간 영역에서 사용
  2. @Transactional이 사용 되어야하는 영역 (rollback을 하는 영역) = 작업 실패시 되돌리기

여기서 DAO란  DB를 사용해 데이터를 조회하거나 조작하는 기능을 전담하는 영역을 의미 합니다.

* ### **Repository Layer**

  1. Database와 같이 데이터 저장소에 접근하는 영역
  2. DAO영역으로 이해
* ### **DTOS**

  1. Dto(Data Transfer Object)는 계층 간에 데이터 교환을 위한 객체이며 Dtos는 이들의 영역을 의미
  2. ex) 뷰 템플릿에서 사용될 객체나 Repository Layer에서 결과로 넘겨준 객체
* ### **Domain Model**

  1. 도메인을 모든 사람이 동일한 관점에서 이해할 수 있고 공유할 수 있도록 단순화한 것
  2. 핵심을 간략하게 단순화해서 표현할 수 있는 모든 것이 도메인 모델
  3. ex) 택시 앱이라고 하면 배차, 탑승, 요금 등이 모두 도메인이 될 수 있습니다.
  4.  비즈니스처리 담당

기본적이 개념을 알았으니 해당개념에 대한 테스트 코드를 작성해 보도록 하겟습니다.
1. Entity클래스 Posts를 web.domain.posts 패키지에
2. EntityRepository인터페이스인 PostsRepository를 web.domain.posts 패키지에
3. PostsRepositoryTest도 작성
   <br/>

## **\-Posts-**

```java
package com.example.book.springboot.web.domain.posts;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;


/*
 * Posts 클래스
 * 실제 DB의 테이블과 매칭될 클래스이며 Entity클래스라고도 합니다
 * 해당 클래스는 Setter메소드가 없는데 자바빈 규약을 생각하면 무작성 getter,setter를 생겅하는 경우가 있지만 Entity클래스에서는 절때 생성하지 않습니다
 * 왜냐하면 무작정 생상시 해당 클래스의 인스턴스 값들이 추후에 어디서 변해야하는지 코드상으로 명확하게 구분이 안돼, 추후 변경시 복잡하기 떄문입니다.
 * 대신 해당 필드의 값 변경이 필요하면 명확학 목적과 의도를 나타낼수 있는 메소드를 추가해야합니다. (메소드명 중요)
 *
 * */

@Getter // 6. lombok 어노테이션, 클래스 내 모든 필드의 getter메소드 자동생성
@NoArgsConstructor // 5. lombok 어노테이션, 기본생성자 자동 추가
@Entity // 1. JPA어노테이션 테이블과 링클될 클래스
public class Posts {

  @Id // 2. 해당 테이블의 PK필드를 의미
  @GeneratedValue(strategy = GenerationType.IDENTITY) // 3. PK 생성 규칙
  private Long id;

  @Column(length = 500, nullable = false) // 4. 테이블 칼럼생성 (사용안해도 무방하지만 추가 변경이 필요할 경우 사용)
  private String title;

  @Column(columnDefinition = "TEXT", nullable = false)
  private String content;
  private String author;

  @Builder // 7. 빌더 패턴 클래스 생성 ()
  public Posts(String title, String content, String author){
    this.title = title;
    this.content = content;
    this.author = author;
  }

  public void update(String title, String content){
    this.title = title;
    this.content = content;
  }

}
```

1. @Entity를 통해 클래스를 생성하면 그 클래스는 데이터베이스의 테이블이 됩니다.
2. @Id를 통해 기본키를 설정하고 @Column을 통해 테이블의 칼럼을 만듬
3. @Column을 안써도 무방하지만 추가 변경이 필요할 경우 사용
4. @Builder 기본생성자 생성과 기능은 같지만 빌더 패턴 클래스라는 것으로 생성을 하는경우 각 필드마다 어떤 값을 넣어야하는지 알수있게 도와주는 어노테이션

## **\-PostsRepository-**

```java
package com.example.book.springboot.web.domain.posts;

/*
 * Posts 클래스로 Database 접근하게 도와줄 JpaRepository, DB Layer 접근자, 인터페이스로 생성
 * JpaRepository<Entity클래스,PK타입>를 상속하면 기본적인 CRUD메소드가 자동생성됨
 * 즉 Entity클래스로 데이터베이스 접근을하는 데이터저장소
 * 또한 Entity클래스와 EntityRepository인터페이스는 같은 패키지에 위치하여야한다
 * */

import org.springframework.data.jpa.repository.JpaRepository;

public interface PostsRepository extends JpaRepository<Posts,Long> {
}

```

## **\-PostsRepositoryTest-**

```java
package com.example.book.springboot.web.domain.posts;

import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import static org.junit.Assert.*; // 이 방법으로 쓰지말고
import static org.assertj.core.api.Assertions.assertThat; // 이 방법을 쓰자
import java.util.List;

/*
 * JpaRepositoryTest
 *  sava,findAll 기능을 테스트 해보기
 */

@RunWith(SpringRunner.class) // 1. 테스트 진행지 JUnit에 내장된 실행자 외 다른 실행자 실행 즉 스트링부트 테스트와 JUnit의 연결자 (SpringRunner 실행)
@SpringBootTest
public class PostsRepositoryTest {

  @Autowired // 2. 스프링이 관리하는 빈을 주입 받음
  PostsRepository postsRepository;

  @After
  // 3. Junit 단위 테스트 끝날때 마다 수행, // 배포 전 전체 테스트 수행할때 테스트간 데이터 침법을 막기위해 사용하기도 하며 여러 테스트가 동시 실행시 h2에 데이터가 남아 다음 실행시 테스트 실패 가능성이 있음
  public void cleanUp() {
    postsRepository.deleteAll();
  }

  @Test
  public void post_load() {
    // 초기값 설정
    String title = "테스트 게시글";
    String content = "테스트 본문";

    postsRepository.save(Posts.builder()
            .title(title)
            .content(content)
            .author("ggury@gmail.com")
            .build()); // 4. posts에 insert,update 쿼리 실행 id가 있으면 update없으면 insert

    // 객체 생성 ()
    List<Posts> postsList = postsRepository.findAll(); // 5. 테이블 posts에 있는 모든 데이터를 조회해오는 메소드

    // 값 검증 및 확인
    Posts posts = postsList.get(0);
    assertThat(posts.getTitle()).isEqualTo(title);
    assertThat(posts.getContent()).isEqualTo(content);
  }
}

```
1. save 메소드는 posts 테이블에 insert, update 쿼리를 실행 / id가 있으면 update 없으면 insert 실행 합니다.
2. findAll메소드는 테이블 posts에 있는 모든 데이터를 조회해 옵니다.


이제 등록,수정,삭제, 기능을 구현 해보겠습니다.

1.  Controller인 PostsApiController를 web 패키지에
2.  Dto인 PostsSaveRequestDto를 web.dto 패키지에
3.  Service인 PostsService를 service.posts 패키지에 생성하겠습니다.

## **\-PostsApiController-**

```java
@RequiredArgsConstructor // 생성자 (선언된 모든 final필드가 포함된 생성자 생성 (final이 없는 필드는 생성자에 포함되지 않음))
@RestController // 컨트롤러를 JSON을 반환 하는 컨트롤러로 만들어줌
public class PostsApiController {
    private final PostsService postsService;
    
    @PostMapping("/api/v1/posts")
    public Long save(@RequestBody PostsSaveRequestDto requestDto){
        return postsService.save(requestDto);
    }
}
```
* ### **@RequiredArgsConstructor**
* 생성자 (선언된 모든 final필드가 포함된 생성자 생성 (final이 없는 필드는 생성자에 포함되지 않음)), final를 사용하는 이유를 나중에 필드 값을 바꿀 일이 있어도 일일이 바꿔 줄 필요가 없기 때문입니다. @Autowird를 사용하지 않고 해당 방법으로 생성자를 주입 하면서 Bean까지 주입

* ### **@RestController**
* MVC Controller에서 JSON을 반환하게 만들어줍니다. (안전하게 정보 교환하는 인터페이스)

* ### **@PostMapping**
* 데이터를 게시할 때 사용 (데이터 전송)

* ### **@RequestBody**
* HTTP 요청의 body 내용을 자바 객체로 바꾸어 줌 (글 작성 후 등록을 누르면 생성되는 body내용을 PostsSaveRequestDto 객체로 바꾸어 줌)


## **\-PostsService-**

```java
@RequiredArgsConstructor // 생성자 (선언된 모든 final필드가 포함된 생성자 생성 (final이 없는 필드는 생성자에 포함되지 않음))
@Service // 알맞은 정보를 가공 -> 비즈니스 로직을 수행 -> DB에접근하는 DAO(sql문을 실행할 수 잇는 객체 )이용해서 결과값을 받아옴
public class PostsService {
    private final PostsRepository postsRepository;


    /*(db 상태변경, begin,commit 자동 수행, 예외발생시 rollback처리 자동) 즉 해당 어노테이션이 추가되면 프록시 객체가 생성
    이 프록시 객체는 메소드 메소드 호출시 정상 여부에 따라 Commit 또는 Rollback을 함 */
    @Transactional
    public Long save(PostsSaveRequestDto requestDto) {
        return postsRepository.save(requestDto.toEntity()).getId();
    }
}
```

## **\-PostsSaveRequestDto-**

```java
@Getter
//@NoArgsConstructor // 기본생성자 자동 추가 lombok 어노테이션,
@RequiredArgsConstructor // 생성자 (선언된 모든 final필드가 포함된 생성자 생성 (final이 없는 필드는 생성자에 포함되지 않음))
public class PostsSaveRequestDto {
    private String title;
    private String content;
    private String author;

    @Builder
    public PostsSaveRequestDto(String title, String content, String author){
        Assert.hasText(title, "title must not be empty");
        Assert.hasText(content, "content must not be empty");
        Assert.hasText(author, "author must not be empty");

        this.title = title;
        this.content = content;
        this.author = author;
    }
    
    // entity란 DB에서 영속적으로 저장된 데이터를 자바 객체로 매핑하여 '인스턴스의 형태'로 존재하는 데이터
    public Posts toEntity(){
        return Posts.builder()
                .title(title)
                .content(content)
                .author(author)
                .build();
    }
}
```

### **@Getter**
* 데이터를 가져올 때 사용 (데이터 전송)

### **@NoArgsConstructor**
* 기본생성자 자동 추가 lombok 어노테이션,

### **@Builder**
* 기본생성자 생성과 기능은 같지만 빌더 패턴 클래스라는 것으로 생성을 하는경우 각 필드마다 어떤 값을 넣어야하는지 알수있게 도와주는 어노테이션 (필드 순서가 뒤바뀌어도 에러발생 X)

## **\-PostsApiControllerTest-**

```java
package com.example.book.springboot.web;

/*
 * API 테스트
 *
 * */

import com.example.book.springboot.web.domain.posts.Posts;
import com.example.book.springboot.web.domain.posts.PostsRepository;
import com.example.book.springboot.web.dto.PostsSaveRequestDto;
import org.junit.After;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat; // 이 방법을 쓰자

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class PostsApiControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private PostsRepository postsRepository;

    @After
    public void tearDown() throws Exception {
        postsRepository.deleteAll();
    }

    @Test
    public void posts_registration() throws Exception {
        // 초기값 설정
        String title = "title";
        String content = "content";
        PostsSaveRequestDto requestDto = PostsSaveRequestDto.builder()
                .title(title)
                .content(content)
                .author("author")
                .build();

        String url = "http://localhost:" + port + "/api/v1/posts";

        // 언제
        ResponseEntity<Long> responseEntity = restTemplate.postForEntity(url, requestDto, Long.class);

        // 그 후
        assertThat(responseEntity.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(responseEntity.getBody()).isGreaterThan(0L);

        List<Posts> all = postsRepository.findAll();
        assertThat(all.get(0).getTitle()).isEqualTo(title);
        assertThat(all.get(0).getContent()).isEqualTo(content);
    }
}
```

### **@SpringBootTest **
* 단위 테스트할때는 @MockMvcTest를 사용하지만 컨트롤러에서 서비스까지 넘어가는 테스트를 할때에는 전체적인 흐름을 테스트 할 수 있는 @SpringBootTest를 사용합니다.

### **@@LocalServerPort**
* 랜덤 HTTP 포트 사용

### **@RestTemplate, @TestRestTemplate **
* 통합 테스트 https://yjksw.github.io/spring-boot-testresttemplate/ 해당부분을 참고하길 바랍니다.
* JPA사용안할땐 @WebMvcTest 사용 JPA 기능과 외부연동과 관련된 부분을 확인 할땐 TestRestTemplate를 사용


