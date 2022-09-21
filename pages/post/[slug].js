const BlockContent = require("@sanity/block-content-to-react");
import SyntaxHighlighter from "react-syntax-highlighter";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import imageUrlBuilder from "@sanity/image-url";
import styles from "../../styles/Home.module.css";
import { useVisitorData } from "@fingerprintjs/fingerprintjs-pro-react";
import {
  updateDoc,
  doc,
  collection,
  arrayUnion,
  getDocs,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../../Utils";

function Post({ title, body, image, slug }) {
  const [content, setContent] = useState("");
  const [visitorId, setVisitorId] = useState();
  const { isLoading, getData } = useVisitorData({ immediate: true });
  const [modal, setModal] = useState(false);

  const [imageUrl, setImageUrl] = useState();
  const router = useRouter();

  const visitedTimes = async () => {
    await getData().then(async (visitor) => {
      // console.log(visitor);
      const visited = {
        visitorId: visitor.visitorId,
        visitedPostId: slug,
      };

      const { visitorId, visitedPostId } = visited;
      // console.log(visitedPostId);

      const visitorRef = doc(db, "visitors", `${visitorId}`);

      const Visitors = await getDocs(collection(db, "visitors"));

      // if (Visitors.length === 0) {
      //   await setDoc(doc(visitorRef, `${visitorId}`), {
      //     postsVisited: [visitedPostId],
      //   });
      // } else {
      //   await addDoc(visitorRef, {
      //     postsVisited: arrayUnion(`${visitedPostId}`),
      //   });
      // }

      Visitors.forEach(async (visitor) => {
        console.log(visitor.data());
        if (visitor.exists()) {
          // console.log(visitor.data(), visitor.data().visitedPosts.length);
          updateDoc(visitorRef, {
            postsVisited: arrayUnion(`${visitedPostId}`),
          });
        } else {
          await setDoc(visitorRef, {
            postsVisited: arrayUnion(`${visitedPostId}`),
          });
        }
        // if (
        //   visitor.data().visitedPosts.length > 3 ||
        //   visitor.data().visitedPosts.length === 3
        // ) {
        //   setModal(true);
        // }
      });
    });
  };

  useEffect(() => {
    visitedTimes();
    const imgBuilder = imageUrlBuilder({
      projectId: "dlwalt36",
      dataset: "production",
    });
    setImageUrl(imgBuilder.image(image));
  }, [image]);

  const serializers = {
    types: {
      code: (props) => (
        <div className="my-2">
          <SyntaxHighlighter language={props.node.language}>
            {props.node.code}
          </SyntaxHighlighter>
        </div>
      ),
    },
  };

  return (
    <>
      <div className={styles.postItem}>
        <div className={styles.postNav} onClick={() => router.push("/")}>
          &#x2190;
        </div>
        {imageUrl && <img src={imageUrl} alt={title} />}
        <div>
          <h1>
            <strong>{title}</strong>
          </h1>
        </div>

        <div className={styles.postBody}>
          <BlockContent
            blocks={body}
            serializers={serializers}
            imageOptions={{ w: 320, h: 240, fit: "max" }}
            projectId={"dlwalt36"}
            dataset={"production"}
          />
        </div>
      </div>
    </>
  );
}
export const getServerSideProps = async (pageContext) => {
  const pageSlug = pageContext.query.slug;
  if (!pageSlug) {
    return {
      notFound: true,
    };
  }
  const particularPost = encodeURIComponent(
    `*[ _type == "post" && slug.current == "${pageSlug}" ]`
  );
  const url = `https://dlwalt36.api.sanity.io/v1/data/query/production?query=${particularPost}`;

  const postData = await fetch(url).then((res) => res.json());
  const postItem = postData.result[0];
  // console.log(postItem);
  if (!postItem) {
    return {
      notFound: true,
    };
  } else {
    return {
      props: {
        title: postItem.title,
        image: postItem.mainImage,
        body: postItem.body,
        slug: postItem.slug.current,
      },
    };
  }
};
export default Post;
