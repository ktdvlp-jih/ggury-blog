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
# **게시판 JPA Auditing으로 생성/수정시간 자동화하기**


보통 Entity에는 데이터의 생성,수정시간이 포함되어있습니다. 매번 데이터를 등록수정을 해야하는데 이런 단순 반복적인 코드를 모든 테이블과 서비스 메소드에 포함되어야 한다면 코드가 지저분해지기 때문에 이 문제를 해결할 JPA Auditing을 사용해 보겠습니다.

## **\-날짜와 시간 출력 API-**
  1. LocalDate: 날짜 정보출력
  2. LocalTime: 시간 정보출력
  3. LocalDateTime: 날짜와 시간 정보출력

먼저 domain 패키지에 BaseTimeEntity클래스를 생성해 보겠습니다.

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

## **\-테스트 코드 결과-**
![Spring WebLayer](/assets/JPA-Auditing-테스트코드-결과.png "Spring WebLayer")

이후 추가될 Entity에는 BaseTimeEntity만 상속 받으면 자동으로 등록/수정시간이 자동저장 되기 때문에 고민할 필요없습니다.

