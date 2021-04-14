import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/bio"
import Layout from "../components/layout"
import SEO from "../components/seo"

// Utilities
import kebabCase from "lodash/kebabCase"

const BlogIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.allMarkdownRemark.nodes
  const tags = data.allMarkdownRemark.group
  console.log(tags);
  console.log(tags.length);
  if (posts.length === 0) {
    return (
      <Layout location={location} title={siteTitle}>
        <SEO title="All posts" />
        <Bio />
        <p>
          No blog posts found. Add markdown posts to "content/blog" (or the
          directory you specified for the "gatsby-source-filesystem" plugin in
          gatsby-config.js).
        </p>
      </Layout>
    )
  }

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts" />
      <Bio />

      <div className="post-list-contaner">

        {tags.length !== 0 && (
          <div class="tagTocWrapper">
            <nav className="container">
                <div className="contents">
                  <ul>
                  {tags.map(tag => {
                    return (
                      <li>
                        <Link
                          to={`/tags/${kebabCase(tag.fieldValue)}/`}
                          itemProp="url"
                          title={tag.fieldValue}
                        >
                          {tag.fieldValue}
                        </Link>

                        <span
                          dangerouslySetInnerHTML={{
                            __html: "("+tag.totalCount+")" || "(0)",
                          }}
                          itemProp="count"
                        />
                      </li>
                    )
                  })}
                  </ul>
                </div>
            </nav>
          </div>          
        )}
        <ol style={{ listStyle: `none` }}>
          {posts.map(post => {
            const title = post.frontmatter.title || post.fields.slug
            const tags = post.frontmatter.tags || false

            return (
              <li key={post.fields.slug}>
                <article
                  className="post-list-item"
                  itemScope
                  itemType="http://schema.org/Article"
                >
                  <header>
                    <h2>
                      <Link to={post.fields.slug} itemProp="url" title={title}>
                        <span itemProp="headline">{title}</span>
                      </Link>
                    </h2>
                    <small>{post.frontmatter.date}</small>
                  </header>
                  <section>
                    {post.frontmatter.thumbnail && (
                      <div className="post-list-thumbnail">
                        <img src={post.frontmatter.thumbnail} alt="" />
                      </div>
                    )}
                    <div className="post-list-content">
                      <p
                        dangerouslySetInnerHTML={{
                          __html: post.frontmatter.description || post.excerpt,
                        }}
                        itemProp="description"
                      />
                      {post.frontmatter.tags && (
                        <ul>
                        {post.frontmatter.tags.map(tag => {
                          return (
                            <li key={tag}>
                              <a href={`/tags/${_.kebabCase(tag)}/`}>{tag}</a>
                            </li>
                          )
                        })}
                        </ul>
                      )}
                    </div>
                  </section>
                </article>
              </li>
            )
          })}
        </ol>
      </div>
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { draft: { eq: false } } }) {
      group(field: frontmatter___tags) {
        fieldValue
        totalCount
      }        
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          category
          description
          tags
          thumbnail
        }
      }
    }
  }
`