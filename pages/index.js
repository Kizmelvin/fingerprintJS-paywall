import styles from "../styles/Home.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import imageUrlBuilder from "@sanity/image-url";

export default function Home({ posts }) {
  const [receivedPosts, setReceivedPosts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    if (posts.length) {
      const imgBuilder = imageUrlBuilder({
        projectId: "dlwalt36",
        dataset: "production",
      });
      setReceivedPosts(
        posts.map((post) => {
          return {
            ...post,
            mainImage: imgBuilder.image(post.mainImage),
          };
        })
      );
    } else {
      setReceivedPosts([]);
    }
  }, [posts]);

  return (
    <div className={styles.main}>
      <h1>Welcome to Blog Page</h1>
      <div className={styles.feed}>
        {receivedPosts.length ? (
          receivedPosts.map((post, index) => (
            <div
              key={index}
              className={styles.post}
              onClick={() => router.push(`/post/${post.slug.current}`)}
            >
              <img
                className={styles.img}
                src={post.mainImage}
                alt="post thumbnail"
              />
              <h3>{post.title}</h3>
            </div>
          ))
        ) : (
          <>No Posts</>
        )}
      </div>
    </div>
  );
}
export const getStaticProps = async (pageContext) => {
  const allPosts = encodeURIComponent(`*[ _type == "post"]`);
  const url = `https://dlwalt36.api.sanity.io/v1/data/query/production?query=${allPosts}`;

  const getPosts = await fetch(url).then((res) => res.json());

  if (!getPosts.result || !getPosts.result.length) {
    return {
      posts: [],
    };
  } else {
    return {
      props: {
        posts: getPosts.result,
      },
    };
  }
};
