---
templateKey: blog-post
draft: false
title: springboot 게시판 JPA Auditing으로 생성-수정시간 자동화하기
date: 2022-08-14T20:44:06.599Z
category: SpringBoot
description: SpringBoot 게시판 JPA Auditing으로 생성-수정시간 자동화하기
tags: 
- SpringBoot0
---
# **게시판 JPA Auditing으로 생성-수정시간 자동화하기**

보통 Entity에는 데이터의 생성,수정시간이 포함되어있습니다. 매번 데이터를 등록수정을 해야하는데 이런 단순 반복적인 코드를 모든 테이블과 서비스 메소드에 포함되어야 한다면 코드가 지저분해지기 때문에 이 문제를 해결할 JPA Auditing을 사용해 보겠습니다.

* ### **LocalDate**
  1. LocalDate라는 날짜 타입을 이용 해 보겠습니다.

먼저 domain 패키지에 BaseTimeEntity클래스를 생성해 보겠습니다.

   <br/>

## **\-BaseTimeEntity-**
BaseTimeEntity클래스는 모든 Entity의 상위 클래스가 되어 createdDate,modifiedDate 등을 자동으로 관리하는 역할

```java
@Getter
@MappedSuperclass // 1. Entity클래스들이 BaseTimeEntity를 상속할 경우 필드에 있는 createdDate,modifiedDate도 칼럼으로 본인의 칼럼으로 인식
@EntityListeners(AuditingEntityListener.class) // 2. BaseTimeEntity클래스에 Auditing기능을 포함시킴
public class BaseTimeEntity {

  @CreatedDate // 3. Entitiy가 생성되어 저장될때 시간이 나중 저장
  private LocalDateTime createdDate;

  @LastModifiedDate // 4. 조회한 Entitiy의 값을 변경할때 시간이 자동 저장
  private LocalDateTime modifiedDate;
}
```

* ### **@RequiredArgsConstructor**
* Entity클래스들이 BaseTimeEntity를 상속할 경우 필드들도 칼럼으로 인식합니다.

* ### **@EntityListeners(AuditingEntityListener.class)**
* BaseTimeEntity클래스에 Auditing기능을 포함시킵니다.

* ### **@CreatedDate**
* Entitiy가 생성되어 저장될때 시간이 나중 저장됩니다

* ### **@LastModifiedDate**
* 조회한 Entitiy의 값을 변경할때 시간이 자동 저장됩니다.

## **\-Application-**
Application과 ApplicationTest클래스에 JPA Auditing을 활성활 시킬수 있는 어노테이션 @EnableJpaAuditing을 추가합니다.

```java
@SpringBootApplication
@EnableJpaAuditing // JPA Auditing 활성화
public class Application {

  public static void main(String[] args) {
      SpringApplication.run(Application.class, args);
  }

}

```

## **\-PostsRepositoryTest-**
테스트 코드 작성 실제 시간이 잘 저장되어 있는지 확인이 가능합니다.

```java
@Test
public void BaseTimeEntity_등록(){
        // 초기값 설정
        String title = "테스트 게시글";
        String content = "테스트 본문";
        String author = "ggury";

        // 초기값
        LocalDateTime now = LocalDateTime.of(2022,8,14,19,27,30);
        postsRepository.save(Posts.builder()
        .title(title)
        .content(content)
        .author(author)
        .build());

        // 언제?
        List<Posts> postsList = postsRepository.findAll();

        // 그 이후
        Posts posts = postsList.get(0);

        System.out.println(">>>>>>> createDate = " + posts.getCreatedDate());
        System.out.println(">>>>>>> modifieDate = " + posts.getModifiedDate());

        assertThat(posts.getCreatedDate()).isAfter(now);
        assertThat(posts.getModifiedDate()).isAfter(now);

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


