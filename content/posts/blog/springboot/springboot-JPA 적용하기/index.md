---
templateKey: blog-post
draft: false
title: springboot springboot-JPA 적용하기
date: 2022-08-07T02:57:06.599Z
category: SpringBoot
description: SpringBoot springboot-JPA 적용하기
tags: 
- SpringBoot
---
# **springboot-JPA 적용하기**
Jpa란 자바 진영의 ORM 기술 표준으로 인터페이스 모음 입니다.
먼저 Jpa를 의존성을 등록하겠습니다.
compile('org.springframework.boot:spring-boot-starter-data-jpa')
compile('com.h2database:h2')
스프링 부트용 Spring Data Jpa 추상화 라이브러리, 버전에 맞게 자동으로 JPA 관련 라이브러리 관리
인메모리형 관계형 데이터베이스 JPA 테스트 용도로 로컬에서만 사용 할 예정

## **\-domain-**
도메인을 담을 패키지로 게시글,댓글,회원,정산,결제 등 소프트웨어에 대한 요구사항의 영역
이제 이 도메인패키지에서 Entity는 Repostory와 함께 있어야하기에 posts패키지와 Posts클래스,PostsRepostory를 만들어보겠습니다.

### **posts**
```java
package com.ggurys.ggurysspringbootwebservice.domain.posts;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter // 롬복
@NoArgsConstructor // 롬복 기본 생성자 자동추가, Public Posts(){}와 같은효과
@Entity // Jpa 어노테이션, 테이블과 연결될 클래스
public class Posts {
    @Id // 테이블의 PK
    @GeneratedValue(strategy = GenerationType.IDENTITY) // PK 규칙
    private Long id;

    @Column(length = 500, nullable = false) // 테이블 칼럼 옵션 설정
    private String title;

    @Column(columnDefinition = "TEXT", length = 500, nullable = false)
    private String content;

    @Column
    private String author;

    @Builder // 빌더 패턴 클래스 생성
    public Posts(Long id, String title, String content, String author){
        this.id = id;
        this.title = title;
        this.content = content;
        this.author = author;

    }
}
```
* 실제 DB 테이블과 매칭될 클래스이면 Entity클래스라고도 합니다.
* JPA사용시 DB작업을 여기 Entity클래스의 수정을 통해 작업 됩니다.

### **postsRepository**
```java
package com.ggurys.ggurysspringbootwebservice.domain.posts;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PostsRepository extends JpaRepository<Posts,Long> {

}
```
* JpaRepository는 Posts 클래스로 Database를 접근하게 해줄 폴더입니다
* 인터페이스 생성후 JpaRepository<Entity 클래스, PK타입>를 상속하면 기본적인 CRUD 메소드가 자동 생성됩니다.

이제 이것을 테스트할 테스트 코드를 작성 해 보도록 하겠씁니다.

### **PostsRepositoryTest**







### **{{id}}**
* List에서 뽑아낸 객체의 필드명

```html
{{>layout/header}}
<h1>스프링 부트로 시작하는 웹서비스</h1>
<div class="col-md-12">
    <div class="row">
        <div class="col-md-6">
            <a href="/posts/save" role="button" class="btn btn-primary">글 등록</a>
        </div>
    </div>
</div>
<br/>
<!--목록 출력 영역-->
<table class="table table-horizontal table-bordered">
    <thead class="thead-strong">
    <tr>
        <th>게시글 번호</th>
        <th>제목</th>
        <th>작성자</th>
        <th>최종수정일</th>
    </tr>
    </thead>
    <tbody id="tbody">
    {{#posts}} <!--posts라는 List를 순회 (for문)-->
    <tr>
        <td>{{id}}</td> <!--List에서 뽑아낸 객체의 필드명-->
        <td>{{title}}</td>
        <td>{{author}}</td>
        <td>{{modifiedDate}}</td>
    </tr>
    {{/posts}}
    </tbody>
</table>
{{>layout/footer}}
```
이후 Controller,Sevice,Repository코드 작성

## **\-PostsRepository-**
여기선 SpringDataJpa에서 제공하지 않는 메소드로 @Query를 사용
규모가 있는 프로젝트에서 데이터 조회는 FK의 조인, 복잡한 조건 등으로 인해 이런 Entity클래스만으로 처리하기 어려워 조회용 프레임 워크를 따로 추가합니다
대표적으로 querydsl,jooq,MyBatis등이 있는데 대표적으로 조희는 querydsl 이것을 사용하고 등록/수정/삭제 등은 SpringDataJpa를 통해 진행합니다.

```java
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
/*
 * Posts 클래스로 Database 접근하게 도와줄 JpaRepository, DB Layer 접근자, 인터페이스로 생성
 * JpaRepository<Entity클래스,PK타입>를 상속하면 기본적인 CRUD메소드가 자동생성됨
 * */
public interface PostsRepository extends JpaRepository<Posts,Long> {
    @Query("SELECT p FROM Posts p ORDER BY p.id DESC") // Posts게시판을 id기준으로 내림차순
    List<Posts> findAllDesc();
}
```
### **@Query**
* 사용자 정의 쿼리

## **\-PostsService-**
```java
@RequiredArgsConstructor // 생성자 (선언된 모든 final필드가 포함된 생성자 생성 (final이 없는 필드는 생성자에 포함되지 않음))
@Service // 알맞은 정보를 가공 -> 비즈니스 로직을 수행 -> DB에접근하는 DAO(sql문을 실행할 수 잇는 객체 )이용해서 결과값을 받아옴
public class PostsService {
    private final PostsRepository postsRepository;

    @Transactional(readOnly = true)
    public List<PostsListResponseDto> findAllDesc() {
        return postsRepository.findAllDesc().stream()
                .map(PostsListResponseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void delete(Long id) {
      Posts posts = postsRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("해당 게시글이 없습니다. id = " + id));
      postsRepository.delete(posts);
    }
}
```
### **@Transactional(readOnly = true)**
* (readOnly=true)를 주면 트랜잭션 범위는 유지하되 조회 기능만 남겨두고 조회 속도가 개선 되기에 등록,삭제,수정 기능이 전혀 없는 서비스 메소드에서
  사용하면 좋습니다.

### **stream()**
* 컬렉션에 저장되어 있는 엘리먼트들을 하나씩 순회하면서 처리하는 코드패턴

### **map**
* .map(PostsListResponseDto::new)는 .map(posts -> new PostsListResponseDto(posts) 이것과 뜻이 똑같습니다.
* postsRepository 결과로 넘어온 Posts의 Stream을 map을 통해 PostsListResponseDto변환 -> List로 반환 하는 메소드

### **collect**
* 지정된 값에서 목록 가져오기 결과를 리턴 받을수 있습니다.


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

## **\-IndexController-**
```java

private final PostsService postsService;

@Getter
public class PostsListResponseDto {
    @RequestMapping("/")
    public String index(Model model) {
        model.addAttribute("posts", postsService.findAllDesc());
        return "index";
    }
}
```
### **Model**
* model 서버 템플릿 엔진에서 사용할 수 있는 객체를 저장 (postsService.findAllDesc()로 가져온 결과를 posts로 index.mustache에 전달)

## **\-테스트 코드 결과-**
![게시판-조회-테스트-결과](/assets/게시판-조회-테스트-결과.png "게시판-조회-테스트-결과")