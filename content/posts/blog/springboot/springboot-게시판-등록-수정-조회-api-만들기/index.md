---
templateKey: blog-post
draft: false
title: SpringBoot 게시판 등록/수정/조회 API 만들기
date: 2022-08-08T13:41:06.599Z
category: Springboot
description: SpringBoot 게시판 등록/수정/조회 API 만들기
tags:
  - SpringBoot
---
# **게시판 등록/수정/조회 API 만들기**



API를 만들기 위해 총 3개의 클래스가 필요합니다.

1. Request(요청) 데이터를 받을 DTO (Data Transfer Object)\
2. API요청을 받을 Controller\
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

기본적이 개념을 알았으니 등록,수정,삭제, 기능을 구현 해보겠습니다.

1.  Controller인 PostsApiController를 web 패키지에
2.  Dto인 PostsSaveRequestDto를 web.dto 패키지에
3.  Service인 PostsService를 service.posts 패키지에 생성하겠습니다.

**import부분은 생략 하도록 하겠습니다.**

<br/>



## **\-PostsApiController-** 

> ```java
> @RequiredArgsConstructor // 생성자 (선언된 모든 final필드가 포함된 생성자 생성 (final이 없는 필드는 생성자에 포함되지 않음))
> @RestController // 컨트롤러를 JSON을 반환 하는 컨트롤러로 만들어줌
> public class PostsApiController {
>
>     private final PostsService postsService;
>
>     @PostMapping("/api/v1/posts")
>     public Long save(@RequestBody PostsSaveRequestDto requestDto){
>         return postsService.save(requestDto);
>     }
> }
> ```



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

    public Posts toEntity(){
        return Posts.builder()
                .title(title)
                .content(content)
                .author(author)
                .build();

    }
}
```